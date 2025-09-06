import pdfParse from 'pdf-parse';

export async function POST(req) {
    console.log('PDF parse route hit');
    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('Buffer size:', buffer.length);
    console.log('First 10 bytes:', buffer.slice(0, 10));

    try {
        const pdfData = await pdfParse(buffer);
        return new Response(pdfData.text, { status: 200 });
    } catch (err) {
        console.error('PDF parse error:', err);
        return new Response('Failed to parse PDF', { status: 500 });
    }
}