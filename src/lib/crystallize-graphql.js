/**
 * If you have enabled authentication on your APIs, then you need to
 * proxy the requests through the Service API:
 * const crystallizeApiUrlBase = import.meta.env.SERVICE_API_URL.replace(
 *  '/graphql',
 *  '/crystallize'
 * );
 * Read more about authentication for the APIs here:
 * https://crystallize.com/learn/developer-guides/api-overview/authentication
 */
const crystallizeApiUrlBase = `https://api.crystallize.com/${import.meta.env.CRYSTALLIZE_TENANT_IDENTIFIER}`;

export function safePathQuery({ variables, ...rest }) {
  if (variables && "path" in variables) {
    const safePath = (variables.path || "")
      .split("?")[0]
      .split("#")[0]
      .replace(/\/$/, "");

    return {
      variables: {
        ...variables,
        path: safePath,
      },
      ...rest,
    };
  }

  return {
    variables,
    ...rest,
  };
}

export async function fetchGraphQL({
  uri = `${crystallizeApiUrlBase}/catalogue`,
  query,
  variables,
}) {
  const body = JSON.stringify(safePathQuery({ query, variables }));

  // isomorphic-unfetch
  const response = await fetch(uri, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export function search(args) {
  return fetchGraphQL({
    uri: `${crystallizeApiUrlBase}/search`,
    ...args,
  });
}

export async function getAllCatalogueItems(language) {
  const response = await fetchGraphQL({
    query: `
      query GET_ALL_CATALOGUE_ITEMS($language: String!) {
        catalogue(language: $language, path: "/") {
          id
          path
          name
          type
          createdAt
          updatedAt
          publishedAt
          children {
            id
            path
            name
            type
            createdAt
            updatedAt
            publishedAt
            shape {
              name
            }
            children {
              id
              path
              name
              type
              createdAt
              updatedAt
              publishedAt
              children {
                id
                path
                name
                type
                createdAt
                updatedAt
                publishedAt
                children {
                  id
                  path
                  name
                  type
                  createdAt
                  updatedAt
                  publishedAt
                  children {
                    id
                    path
                    name
                    type
                    createdAt
                    updatedAt
                    publishedAt
                    children {
                      id
                      path
                      name
                      type
                      createdAt
                      updatedAt
                      publishedAt
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    variables: {
      language,
    },
  });

  return response.data.catalogue.children;
}

export const fragments = `
fragment product on Product {
  id
  language
  vatType {
    name
    percent
  }
  isVirtual
  isSubscriptionOnly
  variants {
    id
    name
    sku
    priceVariants {
      identifier
      price
      currency
    }
    stock
    isDefault
    attributes {
      attribute
      value
    }
    images {
      url
      altText
      variants {
        url
        width
        height
      }
    }
  }
}

fragment item on Item {
  id
  name
  type
  path
  language
  shape {
    name
  }
  components {
    name
    type
    meta {
      key
      value
    }
    content {
      ...singleLine
      ...richText
      ...imageContent
      ...videoContent
      ...paragraphCollection
      ...itemRelations
      ...gridRelations
      ...propertiesTableContent
      ...dateTimeContent
      ...choiceComponent
    }
  }
}

fragment singleLine on SingleLineContent {
  text
}

fragment richText on RichTextContent {
  json
}

fragment image on Image {
  url
  altText
  caption {
    plainText
    html
  }
  variants {
    url
    width
    height
  }
}

fragment video on Video {
  title
  playlists
  thumbnails {
    key
    url
    variants {
      url
      width
    }
  }
}

fragment imageContent on ImageContent {
  images {
    ...image
  }
}

fragment videoContent on VideoContent {
  videos {
    ...video
  }
}

fragment paragraphCollection on ParagraphCollectionContent {
  paragraphs {
    title {
      ...singleLine
    }
    body {
      ...richText
    }
    images {
      ...image
    }
  }
}

fragment itemRelations on ItemRelationsContent {
  items {
    id
    name
    path
    type
    shape {
      name
      id
    }
    topics {
      id
      name 	
    }
    ... on Product {
      variants {
        priceVariants {
          identifier
          price
          currency
        }
        isDefault
        name
        images {
          ...image
        }
      }
    }
    components {
      name
      type
      content {
        ...singleLine
        ...richText
        ...imageContent
        ...videoContent
        ...gridRelations
        ...choiceComponent
        ... on BooleanContent {
          value
        }
        ... on ItemRelationsContent {
          items {
            id
            name
            type
            path
            ... on Item {
              components {
                name
                type
                meta {
                  key
                  value
                }
                content {
                  ...singleLine
                  ...richText
                  ...imageContent
                  ...videoContent
                  ...choiceComponent
                }
              }
            }
            ... on Product {
              variants {
                priceVariants {
                  identifier
                  price
                  currency
                }
                isDefault
                name
                images {
                  ...image
                }
              }
            }
          }
        }
      }
    }
  }
}

fragment gridRelations on GridRelationsContent {
  grids {
    name
    rows {
      columns {
        layout {
          rowspan
          colspan
        }
        itemType
        itemId
        item {
          id
          name
          path
          type
          language
          ... on Product {
            variants {
              id
              name
              sku
              priceVariants {
                identifier
                price
                currency
              }
              stock
              isDefault
              attributes {
                attribute
                value
              }
              image {
                url
                altText
                variants {
                  url
                  width
                  height
                }
              }
            }
            defaultVariant {
              priceVariants {
                identifier
                price
                currency
              }
              isDefault
              name
              images {
                ...image
              }
            }
          }
          components {
            name
            type
            content {
              ...imageContent
              ...videoContent
            }
          }
        }
      }
    }
  }
}

fragment propertiesTableContent on PropertiesTableContent {
  sections {
    title
    properties {
      key
      value
    }
  }
}
 fragment choiceComponent on ComponentChoiceContent {
  selectedComponent {
    name
    type
    content {
      ...gridRelations
      ...on ItemRelationsContent {
        items {
          id
          name
          path
          type
          shape {
            name
            id
          }
          topics {
            id
            name 	
          }
          ... on Product {
            variants {
              priceVariants {
                identifier
                price
                currency
              }
              isDefault
              name
              images {
                ...image
              }
            }
          }
          components {
            name
            type
            content {
              ...singleLine
              ...richText
              ...imageContent
              ...videoContent
              ...gridRelations
              ... on BooleanContent {
                value
              }
            }
          }
        }
      }
    }
  }
}

fragment dateTimeContent on DatetimeContent {
  datetime
}
`;
