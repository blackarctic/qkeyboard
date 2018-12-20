const request = require('request');

const DEFAULT_MR_STATE = 'opened';

const getMergeRequests = async (args) => {

  const {
    state: state = DEFAULT_MR_STATE
  } = args || {};

  const mergeRequests =
    await getMergeRequestsFromApi({ state });

  const pipelineRequests = mergeRequests.map(
    x => getPipelinesForMergeRequestFromApi({
      projectId: x.project_id,
      mergeRequestIid: x.iid
    })
  );

  const pipelinesPerMergeRequest = await Promise.all(pipelineRequests);
  return mergeRequests
    .map((x, i) => ({
      ...x,
      pipelines: pipelinesPerMergeRequest[i]
    }));
};

const getMergeRequestPipelineStatuses = async (args) => {

  const {
    state: state = DEFAULT_MR_STATE
  } = args || {};

  const mergeRequests =
    await getMergeRequests({ state });

  const pipelines = mergeRequests.map(x => x.pipelines[0]);

  return pipelines.map(x => x && x.status);
};

const getMergeRequestsFromApi = async (args) => {
  const {
    state: state = DEFAULT_MR_STATE
  } = args || {};
  return await doApiGetRequest(`/merge_requests?state=${state}`);
};

const getTodos = async () => {
  return await doApiGetRequest(`/todos`);
};

const getPipelinesForMergeRequestFromApi = async (args) => {
  const {
    projectId,
    mergeRequestIid
  } = args || {};
  return await doApiGetRequest(
    `/projects/${projectId}/merge_requests/${mergeRequestIid}/pipelines`
  );
};

const doApiGetRequest = (path) => {
  return new Promise((resolve, reject) => {
    const headers = {
      "Private-Token": process.env.GITLAB_TOKEN
    };
    const url = `${process.env.GITLAB_URL}/api/v4${path}`;
    request.get({
      url,
      headers,
      json: true
    }, (error, response) => {
      if (error) {
        return reject(error);
      }
      if (response.statusCode >= 400) {
        return reject(new Error(
          `${response.statusCode} ${response.statusMessage}`
        ));
      }
      resolve(response.body);
    });
  });
}

// Uncomment to test
//
// (async () => {
//     const res = await getMergeRequestPipelineStatuses({
//         state: 'all'
//     });
//     console.log(res.slice(0, 20));
// })();

module.exports = {
  getMergeRequests,
  getMergeRequestPipelineStatuses,
  getTodos
};
