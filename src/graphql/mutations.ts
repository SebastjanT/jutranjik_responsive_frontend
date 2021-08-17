import { gql } from '@apollo/client';

//  Manual generation trigger for Insight mode
const REQUESTGENERATION = gql`
  mutation requestGeneration($generator: String!, $send: Boolean!) {
    requestGeneration(generator: $generator, send: $send){
      id
      title
      filename
      generationTimeStart
      generationTimeEnd
      fileSize
      lineCountBefore
      lineCountAfter
      hasText
      usedGenerator
      actualData
      recipientsNum
      isPublic
    }
  }
`;

export { REQUESTGENERATION };
