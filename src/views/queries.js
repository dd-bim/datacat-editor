import pkg from '@apollo/client';
const { gql } = pkg;

// login mutation to get access
export const LOGIN_QUERY = gql`
  mutation login($user: LoginInput!) {
    login(input: $user)
  }
`;

// export const METAPROPS = gql`
//   fragment MetaProps on XtdRoot {
//     id
//     name
//     versionId
//     versionDate
//      descriptions {
//        language {
//          languageTag
//        }
//      value
//     }
//     __typename
//     names {
//     language {
//       languageTag
//     }
//     value
//   }
//   }
// `;

// // find class and relations by name
// export function createfindClassWithPropsQuery(className) {
//   const FIND_CLASS_WITH_PROPS = gql`
//   ${METAPROPS}
//   query {
//   findSubjects(input: {query: "${className}"}) {
//     nodes {
//       ...MetaProps
//     	properties {
//         ...MetaProps
//         assignedMeasures {
//           nodes {
//             relatedMeasures {
//               ...MetaProps
//               assignedValues {
//                 nodes {
//                   relatedValues {
//                     ...MetaProps
//                   }
//                 }
//               }
//               assignedUnits {
//                 nodes {
//                   relatedUnits {
//                     ...MetaProps
//                   }
//                 }
//               }
//             }
//           }
//         }
//     	}
//     }
//   }
// }
// `;
//   return FIND_CLASS_WITH_PROPS;
// }

// find class and relations by name
export function createFindClassWithPropsQuery(className) {
  const FIND_CLASS_WITH_PROPS = gql`
  query {
  findSubjects(input: {query: "${className}", pageSize: 1000000}) {
    nodes {
      id
    name
    versionId
    versionDate
    descriptions {
    language {
      languageTag
    }
    value
  }
    __typename
    names {
    language {
      languageTag
    }
    value
  }
    	properties {
        id
    name
    versionId
    versionDate
    descriptions {
    language {
      languageTag
    }
    value
  }
    __typename
    names {
    language {
      languageTag
    }
    value
  }
        assignedMeasures {
          nodes {
            relatedMeasures {
              id
    name
    versionId
    versionDate
    descriptions {
    language {
      languageTag
    }
    value
  }
    __typename
    names {
    language {
      languageTag
    }
    value
  }
              assignedValues {
                nodes {
                  relatedValues {
                    id
    name
    versionId
    versionDate
    descriptions {
    language {
      languageTag
    }
    value
    }
    __typename
    names {
    language {
      languageTag
    }
    value
    }
    toleranceType
      lowerTolerance
      upperTolerance
      valueRole
      valueType
      nominalValue
                  }
                }
              }
              assignedUnits {
                nodes {
                  relatedUnits {
                    id
    name
    versionId
    versionDate
    descriptions {
    language {
      languageTag
    }
    value
  }
    __typename
    names {
    language {
      languageTag
    }
    value
  }
                  }
                }
              }
            }
          }
        }
    	}
    }
  }
}
`;
  return FIND_CLASS_WITH_PROPS;
}


export function createFindBagsQuery(tag) {
const FIND_COLLECTIONS = gql`
query {
  findBags(input: {tagged: "${tag}", pageSize: 1000000}) {
    nodes { 
    	name
      id
      name
      versionId
      versionDate
      descriptions {
      language {
        languageTag
      }
      value
    }
    __typename
    names {
    language {
      languageTag
    }
    value
  }
			collects {
        nodes {
          relatedThings {
            name
          }
        }
      }
    }
  }
}`;
return FIND_COLLECTIONS;
}

export function createFindNestsQuery(tag) {
  const FIND_COLLECTIONS = gql`
  query {
    findNests(input: {tagged: "${tag}", pageSize: 1000000}) {
      nodes { 
        name
        id
        name
        versionId
        versionDate
        descriptions {
        language {
          languageTag
        }
        value
      }
      __typename
      names {
      language {
        languageTag
      }
      value
    }
        collects {
          nodes {
            relatedThings {
              name
            }
          }
        }
      }
    }
  }`;
  return FIND_COLLECTIONS;
  }

export function createFindDocumentsQuery() {
  const FIND_DOCUMENTS = gql`
  query {
    findExternalDocuments(input: {pageSize: 1000000}) {
      nodes { 
        name
        id
        name
        versionId
        versionDate
        descriptions {
        language {
          languageTag
        }
        value
      }
      __typename
      names {
      language {
        languageTag
      }
      value
    }
        documents {
          nodes {
            relatedThings {
              name
            }
          }
        }
      }
    }
  }`;
  return FIND_DOCUMENTS;
  }