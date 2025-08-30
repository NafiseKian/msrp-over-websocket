const  generateRandomString  = require ('./utilities/generators');

class MessagePart 
{
    constructor({ name, contentType, filename, value, contentDisposition }) 
    {
      this.name = name;
      this.contentType = contentType;
      this.filename = filename;
      this.value = value;
      this.contentDisposition = contentDisposition;
    }
  
    toString() 
    {
      return `Content-Type: ${this.contentType}\r\n${this.value}`;
    }
  }


class MultipartMessage 
{
    constructor(boundary) 
    {
      this.boundary = boundary;
      this.parts = [];
    }
  
    addPart(part) 
    {
      this.parts.push(part);
    }
  
    toString() 
    {
      let message = '';
  
      this.parts.forEach((part, index) => 
      {
        if (index === 0) 
        {
          message += `--${this.boundary}\r\n`;
        } 
        else 
        {
          message += `\r\n--${this.boundary}\r\n`;
        }
        message += part.toString();
      });
  
      message += `\r\n--${this.boundary}--\r\n`;
  
      return message;
    }
  }

  
  
  function createEmptyMultiPart() 
  {
    const boundary = generateRandomString(8);
    return new MultipartMessage(boundary);
  }

  module.exports = {
    MessagePart,
    MultipartMessage,
    createEmptyMultiPart,
  };