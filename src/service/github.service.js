const axios = require('axios');
const logger = require('../utils/logger');

const githubApiUrl = 'https://api.github.com';

const graphqlEndPoint = async (query, token) => {
    return await axios.post(`${githubApiUrl}/graphql`, {query: query}, {
        headers: {Authorization: 'bearer ' + token}
    }).then(res => {
        return res.data;
    }).catch(err => logger.error(`GitHub service: graphqlEndPoint error: ${err.message}`));
};

const getRepoActiveWebhooks = async (owner, name, token) => {
    return await axios.get(`${githubApiUrl}/repos/${owner}/${name}/hooks?per_page=100`, {
        headers: { Authorization: 'bearer ' + token, Accept: 'application/vnd.github.v3+json' }
    }).then(res => {
        return res.data.filter(el => el.active === true);
    }).catch(err => logger.error(`GitHub service: getRepoActiveWebhooks error: ${err.message}`));
};

const getRepoTree = async (owner, name, token) => {
    return await axios.get(`${githubApiUrl}/repos/${owner}/${name}/git/trees/master?recursive=1`, {
        headers: { Authorization: 'bearer ' + token, Accept: 'application/vnd.github.v3+json' }
    }).then(res => {
        return res.data.tree;
    }).catch(err => logger.error(`GitHub service: getRepoTree error: ${err.message}`));
};

const getRepoFileContent = async (owner, name, filePath, token) => {
    return await axios.get(`${githubApiUrl}/repos/${owner}/${name}/contents/${filePath}`, {
        headers: { Authorization: 'token ' + token, Accept: 'application/vnd.github.v3.raw+json' }
    }).then(res => {
        return res.data;
    }).catch(err => logger.error(`GitHub service: getRepoFileContent error: ${err.message}`));
};


const RepoFieldQuery = Object.freeze({
    id: "id",
    name: "name",
    owner: "owner { login }",
    size: "size: diskUsage",
    isPrivate: "isPrivate"
});

const getUserRepos = async (expectedFields, token) => {
    expectedFields.forEach((el, i) => expectedFields[i] = RepoFieldQuery[el]);
    const query = `query{ viewer { repositories(last: 100) { nodes {${expectedFields.join()}}}}}`;
    const res = await graphqlEndPoint(query, token);

    logger.info("GitHub service: Return user repositories");
    return res.data.viewer.repositories.nodes;
};

const getRepoTreeDetails = async (owner, name, token, isExpTotalFiles, isExpYmlContent) => {
    let totalFiles, ymlContent;
    const tree = await getRepoTree(owner, name, token);

    if (isExpTotalFiles) {
        totalFiles = tree.filter(el => el.type === 'blob').length;
    }
    if (isExpYmlContent) {
        const el = tree.find(el => el.path.endsWith('.yml'));
        if (el) {
            ymlContent = {
                "path": el.path,
                "content": await getRepoFileContent(owner, name, el.path, token),
                "size": el.size,
                "url": el.url
            }
        }
    }
    return {totalFiles: totalFiles, ymlContent: ymlContent}
};

const getRepoDetails = async (owner, name, expectedFields, token) => {
    let webhooksPromise, treeDetailsPromise;

    const isExpWebhooks = expectedFields.includes('webhooks');
    const isExpTotalFiles = expectedFields.includes('totalFiles');
    const isExpYmlContent = expectedFields.includes('ymlContent');

    if (isExpWebhooks) {
        webhooksPromise = getRepoActiveWebhooks(owner, name, token);
    }
    if (isExpTotalFiles || isExpYmlContent) {
        treeDetailsPromise = getRepoTreeDetails(owner, name, token, isExpTotalFiles, isExpYmlContent);
    }

    expectedFields.forEach((el, i) => {expectedFields[i] = RepoFieldQuery[el]});
    const query = `query{repository(owner: "${owner}", name: "${name}"){${expectedFields.join()}}}`;
    const repoDetailsPromise = graphqlEndPoint(query, token);


    const [webhooks, treeDetails, repoDetails] = [await webhooksPromise, await treeDetailsPromise, await repoDetailsPromise];
    logger.info("GitHub service: Return repository details");
    return {webhooks: webhooks, ...treeDetails, ...repoDetails.data.repository};
}

module.exports = { getUserRepos, getRepoDetails }

