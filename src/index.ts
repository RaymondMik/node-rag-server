import { openai, supabase } from './config.js';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

interface EmbeddingData {
  content: string;
  embedding: number[];
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// LangChain text splitter - Extract and split PDF document
async function splitDocument() {
  try {
    const loader = new PDFLoader('path_to_your_pdf.pdf');
    const docs = await loader.load();

    // Chunk into smaller pieces
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,      // Target chars per chunk
      chunkOverlap: 200     // Overlap to maintain context
    });
    const chunks = await splitter.splitDocuments(docs);
    return chunks;
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
}

// Create embeddings and store in Supabase
async function createAndStoreEmbeddings() {
  const chunkData = await splitDocument();
    console.log(111, chunkData);
    const data = await Promise.all(
      chunkData.map(async (chunk) => {
        const embeddingResponse = await openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: chunk.pageContent
        });
        return { 
          content: chunk.pageContent, 
          embedding: embeddingResponse.data[0].embedding 
        }
      })
    );
  await supabase.from('data').insert(data);
  console.log('SUCCESS!');
}

// Create an embedding vector representing the input text
async function createEmbedding(input: string): Promise<number[]> {
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input
  });
  return embeddingResponse.data[0].embedding;
}

// Query Supabase and return a semantically matching text chunk
async function findNearestMatch(embedding: number[]): Promise<string> {
  const { data } = await supabase.rpc('match_data', {
    query_embedding: embedding,
    match_threshold: 0.50,
    match_count: 1
  });
  
  if (!data || data.length === 0) {
    throw new Error('No matching documents found');
  }
  
  return data[0].content;
}

// Use OpenAI to make the response conversational
const chatMessages: ChatMessage[] = [{
  role: 'system',
  content: 'Sei un esperto consulente in materia di aste legali tenute nella regione Friuli Venezia Giulia. Hai a tua disposizione il testo della perizia redatta dal Tribunale di Gorizia. Sei un avvocato con esperienza in aste legali e sei in grado di rispondere alle domande relative al contenuto del testo della perizia. Se non riesci a trovare la risposta, rispondi con. "Mi dispiace, non ho informazioni su questo argomento."'
}];
async function getChatCompletion(text: string, query: string) {
  chatMessages.push({
    role: 'user',
    content: `Context: ${text} Question: ${query}`
  });

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: chatMessages,
    temperature: 0.5,
    frequency_penalty: 0.5
  });

  console.log(response.choices[0].message.content);
}

// Bring all function calls together
async function main(input: string) {
  const embedding = await createEmbedding(input);
  const match = await findNearestMatch(embedding);
  console.log('Match found:', match);
  await getChatCompletion(match, input);
}

// Entry point - uncomment the function you want to run
async function run() {
  try {
    await createAndStoreEmbeddings();
  
    const query = "A che ora era il mio appuntamento?";
    await main(query);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script
run();
