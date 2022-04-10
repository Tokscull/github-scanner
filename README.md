# Simple github scanner (graphql express server)
- get user repositories (based on access-token)
```graphql
query {
    gitHubUserRepos {
        id,
        name,
        size,
        owner
    }
}
```
- get repository details (based on access-token, repo owner, repo name)
```graphql
query {
    gitHubRepoDetails(owner: "ownerUsername", name: "repoName") {
        id,
        name,
        owner,
        size,
        isPrivate,
        totalFiles,
        webhooks {
            id,
            name,
            url
        }
        ymlContent {
            path,
            content,
            size,
            url
        }
    }
}
```

#Usage
1. Clone repo
2. Create `.env` file in root directory and copy content from `.env.example` into it
3. Run in console `npm install`
4. Run in console `npm run dev`
5. Open GraphiQL IDE and setup 
   - GraphQL Endpoint: `http://localhost:8090/graphql`
   - In http headers add: `access-token: YOUR-GITHUB-ACCCESS-TOKEN` [create token](https://github.com/settings/tokens)
6. Run queries above
