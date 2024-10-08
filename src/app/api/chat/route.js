import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
// Import Together SDK
import Together from 'together-ai';

const systemPrompt = `
You are a rate my professor agent to help students find classes, that takes in user questions and answers them.
For every user question, the top 3 professors that match the user question are returned.
Use them to answer the question if needed.
`;

export async function POST(req) {
  const data = await req.json();

  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
  const index = pc.index('quickstart');

  // Initialize Together API client
  const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

  try {
    const text = data[data.length - 1].content;

    // Create embedding using Together API
    const embeddingResponse = await together.chat.completions.create({ // Adjust method name if needed
      model: 'meta-llama-3.1-405b-instruct',
      input: text,
    });

    const results = await index.query({
      topK: 5,
      includeMetadata: true,
      vector: embeddingResponse.embedding, // Adjust response structure if needed
    });

    let resultString = '';
    results.matches.forEach((match) => {
      resultString += `
      Returned Results:
      Professor: ${match.id}
      Review: ${match.metadata.review}
      Subject: ${match.metadata.subject}
      Stars: ${match.metadata.stars}
      \n\n`;
    });

    const lastMessage = data[data.length - 1];
    const lastMessageContent = lastMessage.content + resultString;
    const lastDataWithoutLastMessage = data.slice(0, data.length - 1);

    // Create chat completion using Together API
    const completion = await together.createCompletion({
      model: 'meta-llama-3.1-405b-instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        ...lastDataWithoutLastMessage,
        { role: 'user', content: lastMessageContent },
      ],
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              const text = encoder.encode(content);
              controller.enqueue(text);
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });
    return new NextResponse(stream);
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse('An error occurred', { status: 500 });
  }
}
