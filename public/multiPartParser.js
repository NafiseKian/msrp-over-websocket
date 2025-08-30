/*
** file : multi part packet parser under java script 
** author : Nafise Kian
** date : August 2024
*/
const EventEmitter = require('events');

class MultipartParser extends EventEmitter {
    constructor() {
        super();
        this.bodies = [];
        this.currentPart = null;
        this.callbacks = {};
        this.headerField = '';
        this.headerValue = '';
        this.state = 's_preamble';
        this.bodyCount = 0; 
    }

    static createEmpty() {
        const parser = new MultipartParser();
        return parser;
    }

    initCallbacks() {
        this.callbacks = {
            on_body_begin: this.onBodyBegin.bind(this),
            on_part_begin: this.onPartBegin.bind(this),
            on_header_field: this.onHeaderField.bind(this),
            on_header_value: this.onHeaderValue.bind(this),
            on_headers_complete: this.onHeadersComplete.bind(this),
            on_part_body: this.onPartBody.bind(this),
            on_part_end: this.onPartEnd.bind(this),
            on_body_end: this.onBodyEnd.bind(this),
        };
    }

    onBodyBegin() 
    {
        this.bodyCount = 0;
        console.log('Body parsing started');
        return 0;
    }

    onPartBegin() 
    {
        if (!this.bodies[this.bodyCount]) 
        {
            this.bodies[this.bodyCount] = { headers: [], body: Buffer.alloc(0), headerCount: 0 };
        }
        this.bodies[this.bodyCount].headerCount = 0;
        console.log(`Part parsing started (part ${this.bodyCount + 1})`);
        return 0;
    }

    onHeaderField(data) 
    {
        const abdy = this.bodies[this.bodyCount];

        if (!abdy.headers[abdy.headerCount]) 
        {
            abdy.headers[abdy.headerCount] = { field: '', value: '' };
        }

        let currhdr = abdy.headers[abdy.headerCount];

        if (currhdr.value && currhdr.value.length > 0) 
        {
            abdy.headerCount++;
            if (abdy.headerCount > MultipartParser.MAX_MP_HEADERS) 
            {
                console.error(`Header count exceeded supported max which is ${MultipartParser.MAX_MP_HEADERS}`);
                return 1;
            }
            currhdr = abdy.headers[abdy.headerCount] = { field: '', value: '' };
        }

        if (!currhdr.field) 
        {
            currhdr.field = data;
        } else {
            currhdr.field += data;
        }

        console.log(`Header field: ${currhdr.field}`);

        return 0;
    }

    onHeaderValue(data) 
    {
        const abdy = this.bodies[this.bodyCount];
        const currhdr = abdy.headers[abdy.headerCount];

        if (!currhdr.value) 
        {
            currhdr.value = data;
        } 
        else 
        {
            currhdr.value += data;
        }

        console.log(`Header value: ${currhdr.value}`);

        return 0;
    }

    onHeadersComplete() 
    {
        const abdy = this.bodies[this.bodyCount];
        const currhdr = abdy.headers[abdy.headerCount];

        if (currhdr && currhdr.value.length > 0) 
        {
            abdy.headerCount++;
        }

        console.log('Headers parsing completed');
        return 0;
    }

    onPartBody(data) 
    {
        const abdy = this.bodies[this.bodyCount];

        if (!abdy.body) 
        {
            abdy.body = Buffer.from(data);
        } 
        else 
        {
            abdy.body = Buffer.concat([abdy.body, Buffer.from(data)]);
        }

        console.log(`Part body: ${abdy.body.toString()}`);

        return 0;
    }

    onPartEnd() 
    {
        console.log(`Part parsing ended (part ${this.bodyCount + 1})`);
        this.bodyCount++;
        return 0;
    }

    onBodyEnd() 
    {
        console.log('Body parsing ended');
        return 0;
    }

    parse(boundary, bodyBuffer) 
    {
        console.log("Parser machine started its job\n");
        const boundaryBuffer = Buffer.from(boundary);
        const boundaryEndBuffer = Buffer.from(`--${boundary}--`);
        let index = 0;
        let mark = 0;
        let ch;
        let state = 's_preamble';

        const headerFieldChars = new Array(256).fill(0);
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-'.split('').forEach(char => {
            headerFieldChars[char.charCodeAt(0)] = 1;
        });

        for (let i = 0; i < bodyBuffer.length; i++) 
        {
            ch = bodyBuffer[i];
            //console.log(`Character at position ${i}: ${ch}`);

            switch (state) 
            {
                case 's_preamble':
                    if (String.fromCharCode(ch) === '-') 
                    {
                        console.log("Found hyphen in preamble, checking for boundary...");
                        state = 's_preamble_hy_hy';
                    }
                break;
                case 's_preamble_hy_hy':
                    if (String.fromCharCode(ch) === '-') 
                    {
                        state = 's_first_boundary';
                    } 
                    else 
                    {
                        state = 's_preamble';
                    }
                break;
                case 's_first_boundary':
                    if (index < (boundaryBuffer.length)) 
                    {
                        if (ch === boundaryBuffer[index]) 
                        {
                            index++;
                            break ;
                        } 
                        else 
                        {
                            console.log("Boundary mismatch at index:", index);
                            console.log(`Expected: ${String.fromCharCode(boundaryBuffer[index])}, Actual: ${String.fromCharCode(ch)}`);
                            return i; 
                        }
                    }
                    if (index === boundaryBuffer.length) 
                    {
                        if (ch === 13) 
                        { 
                            index++; 
                        } 
                        else 
                        {
                            console.log(`Expected CR (\\r) but got ${String.fromCharCode(ch)} at index: ${index}`);
                            return i; 
                        }
                    } 
                    else if (index === boundaryBuffer.length + 1) 
                    {
                        if (ch === 10) 
                        { 
                            this.onBodyBegin();
                            this.onPartBegin();
                            index = 0; 
                            state = 's_header_field_start'; 
                        } 
                        else 
                        {
                            console.log(`Expected LF (\\n) but got ${String.fromCharCode(ch)} at index: ${index}`);
                            return i;
                        }
                    }
                break;  
                case 's_header_field_start':
                    //console.log(" case is s_header_field_start");
                    if (ch === 13) { // CR
                        state = 's_headers_done';
                    } 
                    else 
                    {
                        state = 's_header_field';
                        i--; 
                    }
                    break;

                case 's_header_field':
                    //console.log(" case is s_header_field");
                    mark = i;
                    while (i < bodyBuffer.length && headerFieldChars[bodyBuffer[i]] !== 0) {
                        i++;
                    }
                    if (i > mark) 
                    {
                        this.onHeaderField(bodyBuffer.slice(mark, i).toString());
                    }
                    if (bodyBuffer[i] === 58) { // ':'
                        state = 's_header_value_start';
                    } 
                    else 
                    {
                        return i; 
                    }
                break;
                case 's_header_value_start':
                    //console.log(" case is s_header_value_start");
                    if (ch === 32 || ch === 9) { // SP or HT
                        break;
                    }
                    state = 's_header_value';
                    i--; 
                break;
                case 's_header_value':
                    //console.log(" case is s_header_value");
                    mark = i;
                    while (i < bodyBuffer.length && bodyBuffer[i] !== 13) { // CR
                        i++;
                    }
                    if (i > mark) 
                    {
                        this.onHeaderValue(bodyBuffer.slice(mark, i).toString());
                    }
                    state = 's_header_value_cr';
                break;
                case 's_header_value_cr':
                    //console.log(" case is s_header_value_cr");
                    if (ch === 10) { // LF
                        state = 's_header_field_start';
                    } 
                    else 
                    {
                        return i; // Error
                    }
                break;
                case 's_headers_done':
                    if (ch === 10) { // LF
                        this.onHeadersComplete();
                        state = 's_part_body';
                    } 
                    else 
                    {
                        return i; // Error
                    }
                break;
                case 's_part_body':
                    mark = i;
                    while (i < bodyBuffer.length && bodyBuffer[i] !== 13) { // CR
                        i++;
                    }
                    if (i > mark) 
                    {
                        this.onPartBody(bodyBuffer.slice(mark, i));
                    }
                    state = 's_part_body_cr';
                break;
                case 's_part_body_cr':
                    if (ch === 10) { // LF
                        state = 's_part_body_cr_lf';
                    } 
                    else 
                    {
                        this.onPartBody(Buffer.from('\r'));
                        state = 's_part_body';
                        i--; 
                    }
                break;
                case 's_part_body_cr_lf':
                    if (String.fromCharCode(ch)  === '-') 
                    {
                        state = 's_part_body_cr_lf_hy';
                    } 
                    else 
                    {
                        this.onPartBody(Buffer.from('\r\n'));
                        state = 's_part_body';
                        i--; 
                    }
                break;
                case 's_part_body_cr_lf_hy':
                    if (String.fromCharCode(ch) === '-') 
                    {
                        state = 's_part_body_boundary_start';
                    } 
                    else 
                    {
                        this.onPartBody(Buffer.from('\r\n-'));
                        state = 's_part_body';
                        i--; 
                    }
                break;
                case 's_part_body_boundary_start':
                    index = 0;
                    state = 's_part_body_boundary';
                    i--; 
                break;
                case 's_part_body_boundary':
                    if (index === boundaryBuffer.length) {
                        state = 's_part_body_boundary_done';
                        i--; 
                    } 
                    else if (ch === boundaryBuffer[index]) 
                    {
                        index++;
                    } 
                    else 
                    {
                        this.onPartBody(boundaryBuffer.slice(0, index));
                        state = 's_part_body';
                        i--; 
                    }
                break;
                case 's_part_body_boundary_done':
                    if (ch === 13) 
                    { // CR
                        state = 's_part_body_boundary_done_cr_lf';
                    } 
                    else if (String.fromCharCode(ch)  === '-') 
                    {
                        state = 's_part_body_boundary_done_hy_hy';
                    } 
                    else 
                    {
                        return i; 
                    }
                break;
                case 's_part_body_boundary_done_cr_lf':
                    if (ch === 10) 
                    { // LF
                        this.onPartEnd();
                        this.onPartBegin();
                        state = 's_header_field_start';
                    } 
                    else 
                    {
                        return i; 
                    }
                break;
                case 's_part_body_boundary_done_hy_hy':
                    if (String.fromCharCode(ch)  === '-') 
                    {
                        this.onPartEnd();
                        this.onBodyEnd();
                        state = 's_epilogue';
                    } 
                    else 
                    {
                        return i; 
                    }
                break;
                case 's_epilogue':
                    //TODO : ?
                break;
                default:
                    return i; 
            }
        }

        this.onBodyEnd();
        return bodyBuffer.length;
    }
}

MultipartParser.MAX_MP_HEADERS = 100;

module.exports = { MultipartParser };
