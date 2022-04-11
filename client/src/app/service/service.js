import { gql } from "apollo-boost";

const USER_REPOS = gql`
    query {
        gitHubUserRepos{
            id,
            name,
            size,
            owner
        }
    }
`;

const REPO_DETAILS = gql`
    query get($owner: String!, $name: String!) {
        gitHubRepoDetails(owner: $owner, name: $name) {
            id,
            name,
            owner,
            size,
            isPrivate,
            totalFiles,
            webhooks {
                id,
                name
            }
            ymlContent {
                path,
                content,
                size
            }
        }
    }
`;

export { USER_REPOS, REPO_DETAILS };
