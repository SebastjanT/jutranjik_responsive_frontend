import { gql } from '@apollo/client';

//  Get the generations
const GENERATIONS = gql`
  query generations {
    generations {
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

export { GENERATIONS };
