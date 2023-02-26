import { readFileSync, writeFileSync } from 'fs';
import * as util from 'util';

const FONT_PATH = './AppleColorEmoji.ttf';

function binaryFile(buffer: Buffer) {
    const data = new Uint8Array(buffer);

    let position = 0
    const getUint8 = () => data[position++]
    const getUint16 = () => ((getUint8() << 8) | getUint8()) >>> 0
    const getUint24 = () => ((getUint8() << 16) | (getUint8() << 8) | getUint8()) >>> 0
    const getUint32 = () => getInt32() >>> 0
    const getInt16 = () => {
        let number = getUint16()
        if (number & 0x8000) number -= 1 << 16
        return number
    }

    // unint24 is (getUint16() << 8) | getUint8() as well

    const getInt32 = () => (getUint8() << 24) | (getUint8() << 16) | (getUint8() << 8) | getUint8()

    const getF2Dot14 = () => getInt16() / (1 << 14)
    const getFixed = () => getInt32() / (1 << 16)
    
    const getString = length => {
        let string = ''
        for (let i = 0; i < length; i++) {
            string += String.fromCharCode(getUint8())
        }
        return string
    }

    const getDate = () => {
        const macTime = getUint32() * 0x100000000 + getUint32()
        const utcTime = macTime * 1000 + Date.UTC(1904, 1, 1)
        return new Date(utcTime)
    }

    const getPosition = () => position
    const setPosition = targetPosition => (position = targetPosition)
    return {
        data,
        getUint8,
        getUint16,
        getUint24,
        getUint32,
        getInt16,
        getInt32,
        getFWord: getInt16,
        getUFWord: getUint16,
        getOffset16: getUint16,
        getOffset32: getUint32,
        getF2Dot14,
        getFixed,
        getString,
        getDate,
        getPosition,
        setPosition
    }
}

const fontBuffer = readFileSync(FONT_PATH);
const {
    data,
    getUint8,
    getUint16,
    getUint24,
    getUint32,
    getInt16,
    getInt32,
    getFWord,
    getUFWord,
    getOffset16,
    getOffset32,
    getF2Dot14,
    getFixed,
    getString,
    getDate,
    getPosition,
    setPosition
} = binaryFile(fontBuffer);

getUint32(); // scalarType
const numTables = getUint16();
getUint16(); // searchRange
getUint16(); // entrySelector
getUint16(); // rangeShift

// get the tables
const tables = {}
for (let i = 0; i < numTables; i++) {
  const tag = getString(4)
  tables[tag] = {
    checksum: getUint32(),
    offset: getUint32(),
    length: getUint32(),
  }
}

const size = Object.values(tables).reduce((a,c: any) => a + c.length, 0) as number;
console.log(`Size is ${size / 1000000} MB`);

// sort them by offset
const sortedTables = Object.keys(tables)
    .sort((a,b) => tables[a].offset > tables[b].offset ? 1 : -1);

// drop their data into a map to retain order
const tableMap = new Map();
sortedTables.forEach(key => tableMap.set(key, tables[key]));

const tableReaders = {
    head: () => ({
        majorVersion: getUint16(),
        minorVersion: getUint16(),
        fontRevision: getFixed(),
        checksumAdjustment: getUint32(),
        magicNumber: getUint32(),
        flags: getUint16(),
        unitsPerEm: getUint16(),
        created: getDate(),
        modified: getDate(),
        xMin: getInt16(),
        yMin: getInt16(),
        xMax: getInt16(),
        yMax: getInt16(),
        macStyle: getUint16(),
        lowestRecPPEM: getUint16(),
        fontDirectionHint: getInt16(),
        indexToLocFormat: getInt16(),
        glyphDataFormat: getInt16(),
    }),
    hhea: () => ({
        majorVersion: getUint16(),
        minorVersion: getUint16(),
        ascender: getFWord(),
        descender: getFWord(),
        lineGap: getFWord(),
        advanceWidthMax: getUFWord(),
        minLeftSideBearing: getFWord(),
        minRightSideBearing: getFWord(),
        xMaxExtent: getFWord(),
        caretSlopeRise: getInt16(),
        caretSlopeRun: getInt16(),
        caretOffset: getInt16(),
        reserved1: getInt16(),
        reserved2: getInt16(),
        reserved3: getInt16(),
        reserved4: getInt16(),
        metricDataFormat: getInt16(),
        numberOfHMetrics: getUint16(),
    }),
    maxp: () => ({
        version: getFixed(),
        numGlyphs: getUint16(),
        maxPoints: getUint16(),
        maxContours: getUint16(),
        maxCompositePoints: getUint16(),
        maxCompositeContours: getUint16(),
        maxZones: getUint16(),
        maxTwilightPoints: getUint16(),
        maxStorage: getUint16(),
        maxFunctionDefs: getUint16(),
        maxInstructionDefs: getUint16(),
        maxStackElements: getUint16(),
        maxSizeOfInstructions: getUint16(),
        maxComponentElements: getUint16(),
        maxComponentDepth:  getUint16()
    }),
    'OS/2': () => {
        const  version =  getUint16();
        
        if (version === 4) {
            return {
                version,
                xAvgCharWidth: getUint16(),
                usWeightClass: getUint16(),
                usWidthClass: getUint16(),
                fsType: getUint16(),	
                ySubscriptXSize: getInt16(),
                ySubscriptYSize: getInt16(),
                ySubscriptXOffset: getInt16(),
                ySubscriptYOffset: getInt16(),
                ySuperscriptXSize: getInt16(),
                ySuperscriptYSize: getInt16(),
                ySuperscriptXOffset: getInt16(),
                ySuperscriptYOffset: getInt16(),
                yStrikeoutSize:	getInt16(),
                yStrikeoutPosition:	getInt16(),
                sFamilyClass: getInt16(),
                panose: {
                    bFamilyType: getUint8(),
                    bSerifStyle: getUint8(),
                    bWeight: getUint8(),
                    bProportion: getUint8(),
                    bContrast: getUint8(),
                    bStrokeVariation: getUint8(),
                    bArmStyle: getUint8(),
                    bLetterform: getUint8(),
                    bMidline: getUint8(),
                    bXHeight: getUint8(),
                },
                ulUnicodeRange1: getUint32(),
                ulUnicodeRange2: getUint32(),
                ulUnicodeRange3: getUint32(),
                ulUnicodeRange4: getUint32(),
                achVendID: getUint32(),
                fsSelection: getUint16(),
                usFirstCharIndex: getUint16(),
                usLastCharIndex: getUint16(),
                sTypoAscender: getInt16(),
                sTypoDescender: getInt16(),
                sTypoLineGap: getInt16(),
                usWinAscent: getUint16(),
                usWinDescent: getUint16(),
                ulCodePageRange1: getUint32(),
                ulCodePageRange2: getUint32(),
                sxHeight: getInt16(),
                sCapHeight: getInt16(),
                usDefaultChar: getUint16(),
                usBreakChar: getUint16(),
                usMaxContext: getUint16()
            }
        }
    },
    cmap: (offset: number) => {
        // start with header
        const cmap = {
            version: getUint16(),
            numTables: getUint16(),
            encodingRecords: [] as any[]
        }

        // Format 14: Unicode Variation Sequences
        const format14 = (subtableOffset: number) => {
            // header start
            const f14 = {
                format: getUint16(),
                length: getUint32(),
                numVarSelectorRecords: getUint32(),
                varSelector: [] as any[]
            }

            // VariationSelector array records
            f14.varSelector = [...new Array(f14.numVarSelectorRecords)]
                .map(() => {              
                    /*
                     * VariationSelector contains two more subtables
                     */
                    const varSelector = (getUint16() << 8) | getUint8();
                    const defaultUVSOffset = getOffset32();
                    const nonDefaultUVSOffset =  getOffset32();

                    // Default UVS table
                    let defaultUVSTable = {};
                    if (defaultUVSOffset !== 0) {
                        // setPosition(offset + subtableOffset + defaultUVSOffset);
                        const numUnicodeValueRanges = getUint32();
                        defaultUVSTable = {
                            numUnicodeValueRanges,
                            ranges: [...new Array(numUnicodeValueRanges)]
                                .map(() => ({
                                    startUnicodeValue: String.fromCodePoint(getUint24()),
                                    additionalCount: getUint8()
                                }))
                        }
                    }

                    let nonDefaultUVSTable = {};
                    if (nonDefaultUVSOffset !== 0) {
                        // setPosition(offset + subtableOffset + nonDefaultUVSOffset);
                        const numUVSMappings = getUint32();
                        nonDefaultUVSTable = {
                            numUVSMappings,
                            uvsMappings: [...new Array(numUVSMappings)]
                                .map(() => ({
                                    unicodeValue: getUint24(),
                                    glyphID: getUint16()
                                }))
                        }
                    }

                    return {
                        varSelector,
                        defaultUVSOffset,
                        nonDefaultUVSOffset,
                        defaultUVSTable,
                        nonDefaultUVSTable,
                    };
                });

            return f14;
        };

        // Format 12: Segmented coverage
        const format12 = () => {
            const f12 = {
                format: getUint16(),
                reserved: getUint16(),
                length: getUint32(),
                language: getUint32(),
                numGroups: getUint32(),
                groups: [] as any
            }

            f12.groups = [...new Array(f12.numGroups)].map(() => ({
                startCharCode: String.fromCodePoint(getUint32()),
                endCharCode: String.fromCodePoint(getUint32()),
                startGlyphID: getUint32()
            }));

            return f12;
        }

        // create encoding records
        cmap.encodingRecords = [...new Array(cmap.numTables)]
            .map(() =>({
                platformID: getUint16(),
                encodingID: getUint16(),
                subtableOffset: getOffset32()
            }));

        // iterate to create subtables
        cmap.encodingRecords.forEach((ec, index) => {
            const { platformID, encodingID, subtableOffset } = ec;

            // move cursor to where subtable is of record is
            setPosition(offset + subtableOffset);
            
            // subtable fomart based on platform and encoding
            if (platformID === 0 && encodingID === 5) {
                cmap.encodingRecords[index].subtableData = format14(subtableOffset);
            }
            if (platformID === 3 && encodingID === 10) {
                cmap.encodingRecords[index].subtableData = format12();
            }
        })

        return cmap;
    },
    CBLC_ignore: (offset: number) => {
        // start with header
        const CBLC = {
            majorVersion: getUint16(),
            minorVersion: getUint16(),
            numSizes: getUint32(),
            BitmapSize: [] as any[]
        }

        const SbitLineMetrics = () => ({
            ascender: getUint8(),
            descender: getUint8(),
            widthMax: getUint8(),
            caretSlopeNumerator: getUint8(),
            caretSlopeDenominator: getUint8(),
            caretOffset: getUint8(),
            minOriginSB: getUint8(),
            minAdvanceSB: getUint8(),
            maxBeforeBL: getUint8(),
            minAfterBL: getUint8(),
            pad1: getUint8(),
            pad2: getUint8()
        })

        CBLC.BitmapSize = [...new Array(CBLC.numSizes)].map(() => ({
            indexSubTableArrayOffset: getOffset32(),
            indexTablesSize: getUint32(),
            numberOfIndexSubTables: getUint32(),
            colorRef: getUint32(),
            hori: SbitLineMetrics(),
            vert: SbitLineMetrics(),
            startGlyphIndex: getUint16(),
            endGlyphIndex: getUint16(),
            ppemX:getUint8(),
            ppemY: getUint8(),
            bitDepth: getUint8(),
            flags: getUint8()
        }));

        return CBLC;
    }
}

console.log('======');
console.log('TABLES')
console.log('======');
for (const [key,value] of tableMap.entries()) {
    console.log(key, value);
}
console.log();

const inspectOptions = {
    showHidden: false, 
    depth: null, 
    colors: true, 
    maxArrayLength: 10, 
    maxStringLength: null
}

const allTables = {};
for (const [key,value] of tableMap.entries()) {
    if (! (key in tableReaders)) continue;
    
    const { offset } = value;
    console.log('======');
    console.log(key);
    console.log('======');
    
    setPosition(offset);

    const table = tableReaders[key](offset);

    allTables[key] = table;

    console.log(util.inspect(table, inspectOptions));   
    console.log(); 
}

writeFileSync('./output.json', JSON.stringify(allTables), 'utf-8');