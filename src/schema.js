const { GraphQLSchema, GraphQLObjectType, GraphQLInt,
    GraphQLString, GraphQLList, GraphQLNonNull,
    GraphQLID, GraphQLBoolean } = require('graphql');
const graphqlFields = require('graphql-fields');
const githubService = require('./service/github.service');
const logger = require('./utils/logger');


const RepoType = new GraphQLObjectType({
    name: "Repo",
    description: "GitHub repository",
    fields: () => ({
        "id": { type: GraphQLID },
        "name": { type: GraphQLString },
        "owner": {
            type: GraphQLString,
            resolve: (obj) => obj.owner.login
        },
        "size": { type: GraphQLInt },
    })
});

const WebhookType = new GraphQLObjectType({
    name: "Webhook",
    description: "GitHub repository webhooks",
    fields: () => ({
        "id": { type: GraphQLID },
        "name": { type: GraphQLString },
        "url": { type: GraphQLString },
    })
});

const FileInfoType = new GraphQLObjectType({
    name: "FileInfo",
    description: "GitHub repository file info",
    fields: () => ({
        "path": { type: GraphQLString },
        "content": { type: GraphQLString },
        "size": { type: GraphQLInt },
        "url": { type: GraphQLString}
    })
});

const RepoDetailsType = new GraphQLObjectType({
    name: "RepoDetails",
    description: "GitHub repository details",
    fields: () => ({
        "id": { type: GraphQLID },
        "name": { type: GraphQLString },
        "owner": {
            type: GraphQLString,
            resolve: (obj) => obj.owner.login
        },
        "size": { type: GraphQLInt },
        "isPrivate": { type: GraphQLBoolean },
        "totalFiles": { type: GraphQLInt },
        "ymlContent": { type: FileInfoType },
        "webhooks": { type: new GraphQLList(WebhookType) },
    })
});

const query = new GraphQLObjectType({
    name: 'Query',
    description: 'Github scanner',
    fields: () => ({
        gitHubUserRepos: {
            type: new GraphQLList(RepoType),
            description: "Show List of Repositories",
            resolve: async (obj, args, context, info) => {
                logger.info("Received a request to get all repositories by access token");
                const topLevelFields = Object.keys(graphqlFields(info));
                return await githubService.getUserRepos(topLevelFields, context.headers['access-token']);
            }
        },
        gitHubRepoDetails: {
            type: RepoDetailsType,
            description: "Show Repository details",
            args: {
                owner: {
                    type: new GraphQLNonNull(GraphQLString),
                    description: "Github owner username"
                },
                name: {
                    type: new GraphQLNonNull(GraphQLString),
                    description: "Github repository name"
                }
            },
            resolve: async (obj, args, context, info) => {
                logger.info(`Received a request to get repository details by owner: ${args.owner} and repo: ${args.name}`);
                const topLevelFields = Object.keys(graphqlFields(info));
                return await githubService.getRepoDetails(args.owner, args.name, topLevelFields, context.headers['access-token']);
            }
        }
    })
});

const schema = new GraphQLSchema({
    query
});

module.exports = schema;


