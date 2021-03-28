/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createCamera = /* GraphQL */ `
  mutation CreateCamera(
    $input: CreateCameraInput!
    $condition: ModelCameraConditionInput
  ) {
    createCamera(input: $input, condition: $condition) {
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
export const updateCamera = /* GraphQL */ `
  mutation UpdateCamera(
    $input: UpdateCameraInput!
    $condition: ModelCameraConditionInput
  ) {
    updateCamera(input: $input, condition: $condition) {
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
export const deleteCamera = /* GraphQL */ `
  mutation DeleteCamera(
    $input: DeleteCameraInput!
    $condition: ModelCameraConditionInput
  ) {
    deleteCamera(input: $input, condition: $condition) {
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
