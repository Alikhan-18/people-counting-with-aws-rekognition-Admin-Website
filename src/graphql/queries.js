/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getCamera = /* GraphQL */ `
  query GetCamera($id: ID!) {
    getCamera(id: $id) {
      id
      H
      W
      logicalName
      zones {
        id
        name
        zoneNumber
        X1
        Y1
        X2
        Y2
      }
      createdAt
      updatedAt
    }
  }
`;
export const listCameras = /* GraphQL */ `
  query ListCameras(
    $filter: ModelCameraFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCameras(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        H
        W
        logicalName
        zones {
          id
          name
          zoneNumber
          X1
          Y1
          X2
          Y2
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
