import * as React from 'react';
import { useLazyQuery } from '@apollo/react-hooks';
import 'bootstrap/dist/css/bootstrap.min.css';
import { USER_REPOS, REPO_DETAILS } from './service/service';
import { Button, Form, FormControl, InputGroup, Table } from "react-bootstrap";


function App() {
    const [accessToken, setAccessToken] = React.useState("");
    const [getUserRepos, { loading: loadingUserRepos, data: userRepos }] = useLazyQuery(USER_REPOS);
    const [getRepoDetails, { loading: loadingRepoDetails, data: repoDetails }] = useLazyQuery(REPO_DETAILS);


    const saveToken = (event) => {
        event.preventDefault();
        localStorage.setItem("access-token", accessToken)
    }

    return (
        <div className="App" style={{padding: 20}}>
            <Form.Label>Github personal access token</Form.Label>
            <InputGroup className="mb-3">
                <FormControl
                    type="password"
                    placeholder="Github personal access token"
                    onChange={event => {
                        setAccessToken(event.target.value)
                    }}
                />
                <Button variant="outline-primary" id="button-addon2" onClick={saveToken}>
                    Save
                </Button>
            </InputGroup>
            <div>
                <Button style={{marginBottom: 20}} variant="outline-primary" onClick={() => getUserRepos()}>Load user repositories</Button>
                {loadingUserRepos && <p>Loading...</p>}
                {!loadingUserRepos && userRepos && (
                    <Table striped bordered hover size="sm">
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Owner</th>
                            <th>Size (Kb)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {userRepos.gitHubUserRepos.map(el => (
                            <tr>
                                <td>{el.name}</td>
                                <td>{el.owner}</td>
                                <td>{el.size}</td>
                                <td>
                                    <Button variant="outline-primary" size="sm"
                                            onClick={() => getRepoDetails({ variables: { owner: el.owner, name: el.name }})}>
                                        Details
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                )}
            </div>
            <div>
                {loadingRepoDetails && <p>Loading...</p>}
                {!loadingRepoDetails && repoDetails && (
                    <div>
                        <h3>Repository details:</h3>
                        <p><b>Name:</b> {repoDetails.gitHubRepoDetails.name}</p>
                        <p><b>Owner:</b> {repoDetails.gitHubRepoDetails.owner}</p>
                        <p><b>Size:</b> {repoDetails.gitHubRepoDetails.size} Kb</p>
                        <p><b>Type:</b> {repoDetails.gitHubRepoDetails.isPrivate ? 'Private' : 'Public'}</p>
                        <p><b>Total Files:</b> {repoDetails.gitHubRepoDetails.totalFiles}</p>
                        <p><b>Active webhooks:</b> (Total: {repoDetails.gitHubRepoDetails.webhooks.length})</p>
                        <ul>
                            {repoDetails.gitHubRepoDetails.webhooks.map(el => (
                                <li>
                                    <p>id: {el.id}, name: {el.name}</p>
                                </li>
                            ))}
                        </ul>
                        {repoDetails.gitHubRepoDetails.ymlContent ? (
                            <div>
                                <p><b>Yml file:</b> {repoDetails.gitHubRepoDetails.ymlContent.path}</p>
                                <Form.Control as="textarea" readOnly="true" rows={15} value={repoDetails.gitHubRepoDetails.ymlContent.content} />
                            </div>
                        ) : <p><b>Yml file:</b> not one in this repository</p>}
                    </div>
                )}
            </div>
        </div>
    )

}

export default App;
