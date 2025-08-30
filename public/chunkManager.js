/*
** file : msrp message chunk manager under javascript
** author : Nafise Kian
** date : September 2024
*/

class ChunkManager 
{
    constructor() 
    {
        this.chunkHead = null;
        this.chunkTail = null;
        this.MAX_CHUNK_SIZE = 2048;
    }

    getChunkHead() 
    {
        let ref = this.chunkHead;
        
        while (ref && ref.prev !== null) 
        {
            ref = ref.prev;
        }
        return ref;
    }

    getChunkTail() 
    {
        let ref = this.chunkTail;

        while (ref && ref.next !== null) 
        {
            ref = ref.next;
        }
        return ref;
    }

    addChunk(newChunk) 
    {
        if (!this.chunkHead) 
        {
            this.chunkHead = newChunk;
            this.chunkTail = newChunk;
        } 
        else 
        {
            let tail = this.getChunkTail();
            tail.next = newChunk;
            newChunk.prev = tail;
            this.chunkTail = newChunk;
        }
    }

    createChunks(message) 
    {
        let offset = 0;
        let totalLength = message.length;
        let chunkCount = 0;

        while (offset < totalLength) {
            let chunkSize = Math.min(this.MAX_CHUNK_SIZE, totalLength - offset);
            let chunkContent = message.slice(offset, offset + chunkSize);

            let byteRangeStart = offset + 1;
            let byteRangeEnd = offset + chunkSize;

            let chunk = {
                byteRangeStart: byteRangeStart,
                byteRangeEnd: byteRangeEnd,
                byteRangeTotal: totalLength,
                msgContent: chunkContent,
                contFlag: byteRangeEnd === totalLength ? 1 : 0,
                next: null,
                prev: null
            };

            this.addChunk(chunk);
            offset += chunkSize;
            chunkCount++;

            console.log(`Created chunk ${chunkCount} from ${byteRangeStart} to ${byteRangeEnd}`);
        }
    }

    isComplete() 
    {
        let ref = this.getChunkHead();
        if (!ref || ref.byteRangeStart !== 1) return false;

        let prevEnd = ref.byteRangeEnd;
        while (ref.next !== null) 
        {
            ref = ref.next;
            if (ref.byteRangeStart !== (prevEnd + 1)) return false;
            prevEnd = ref.byteRangeEnd;
        }

        return ref.byteRangeEnd === ref.byteRangeTotal && ref.contFlag === '$';
    }


    getAllContent() 
    {
        let ref = this.getChunkHead();
        let content = '';
        while (ref !== null) 
        {
            content += ref.msgContent;
            ref = ref.next;
        }
        return content;
    }
}

module.exports = ChunkManager;

