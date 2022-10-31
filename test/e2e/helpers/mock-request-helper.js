// match to sequence of all characters including end-of-line
const MATCH_ALL = '[\\s\\S]*';

/**
 * @param {PlayWrightRequest} request
 * @param {GraphQLMock} mockData
 * @returns {boolean}
 */
const matchRequest = (request, { matchBody, method }) =>
  matchBody.test(request.postData()) && method === request.method();

export const matchMockRequest = (request, mocks) =>
  mocks.find(mock => matchRequest(request, mock));

export const matchGraphQLRequest = (request, mocks) =>
  mocks.find(mock => matchRequest(request, { ...mock, method: 'POST' }));

export const buildMockResponse = ({ data }) => ({
  headers: { 'access-control-allow-origin': '*' },
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(data),
});

/**
 * Creates a RegExp to multi-line text to snippets of the form: "key":"value"
 * @param {Object.<String, String>} props
 * @returns {RegExp}
 */
export const createPropertyRegex = props => {
  const propMatchExpression = Object.entries(props)
    .map(([key, value]) => `"${key}": *"${value}"`)
    .join(MATCH_ALL);

  return new RegExp(MATCH_ALL + propMatchExpression + MATCH_ALL, 'g');
};
