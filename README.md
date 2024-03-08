    <h1>DocTalker Web Application Usage Guide</h1>

    <h2>1. Upload Document</h2>
    <ul>
        <li><strong>Endpoint:</strong> /upload/upload</li>
        <li><strong>Functionality:</strong> Uploads a PDF file to AWS S3 and saves its location to MongoDB.</li>
        <li><strong>Instructions:</strong> Use a tool like Postman to send a POST request with the file as a parameter (the key must be named 'file'), or use a form field with the name 'file'.</li>
    </ul>

    <h2>2. Process Document</h2>
    <ul>
        <li><strong>Endpoint:</strong> /upload/process</li>
        <li><strong>Functionality:</strong> Extracts text from the uploaded document stored in AWS S3, processes it, creates chunks, generates embeddings, and saves them to Pinecone DB. Vector indices are then saved in MongoDB.</li>
        <li><strong>Instructions:</strong> Provide the ID of the uploaded file.</li>
    </ul>

    <h2>3. Query Document</h2>
    <ul>
        <li><strong>Endpoint:</strong> /query/query-process</li>
        <li><strong>Functionality:</strong> Extracts a query from the user, generates embeddings, performs a similarity search based on embedded chunks, and returns the top results.</li>
        <li><strong>Instructions:</strong> Provide the ID of the uploaded file.</li>
    </ul>

    <h3>Additional Notes:</h3>
    <ul>
        <li>Ensure the uploaded document is in PDF format.</li>
        <li>The document processing step involves extracting meaningful information and generating embeddings for efficient querying.</li>
        <li>Queries are processed to find the most relevant chunks in the document.</li>
        <li>Utilize the provided endpoints with the specified parameters to seamlessly interact with the DocTalker application.</li>
    </ul>

    <p>For any further assistance or inquiries, feel free to contact our support team. Happy document processing with DocTalker! 🚀</p>
