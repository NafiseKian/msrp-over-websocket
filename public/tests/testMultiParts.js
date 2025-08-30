const { MultipartParser } = require('../multiPartParser');
const  { MessagePart, createEmptyMultiPart } = require('../multiPartBuilder');
const { createRequestControlMessage } = require ('../cmsgBuilder');
const  generateRandomString  = require ('../utilities/generators');

function extractBoundary(text) {
    const lines = text.split(/\r?\n/);
    for (let line of lines) {
        if (line.startsWith('--')) 
        {
            const boundary = line.slice(2).trim();
            if (boundary) 
            {
                return boundary;
            }
        }
    }
    return null; 
}

const multipartMessage = createEmptyMultiPart();



const part1 = new MessagePart({
      name: 'part1',
      contentType: 'application/rechat.cntl+json\r\n',
      filename: 'file1.txt',
      value: createRequestControlMessage(generateRandomString(8), 'message-to', 'from-name:me , to-name:merve,message-to-type:direct-chat'),
      contentDisposition: 'attachment',
});

const part2 = new MessagePart({
      name: 'part2',
      contentType: 'text/plain\r\n',
      filename: 'file2.txt',
      value: "hi",
      contentDisposition: 'attachment',
});

multipartMessage.addPart(part1);
multipartMessage.addPart(part2);
console.log(multipartMessage.toString());


const parser = new MultipartParser();

let boundary = extractBoundary(multipartMessage.toString());
console.log("boundary is : "+boundary);

const parsedLength = parser.parse(boundary, Buffer.from(multipartMessage.toString()));

console.log('Parsed Length:', parsedLength);
console.log('Number of parsed parts:', parser.bodies.length);


