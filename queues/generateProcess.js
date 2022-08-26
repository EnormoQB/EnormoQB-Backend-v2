const PdfMake = require('pdfmake');
const fs = require('fs');
const imageDataURI = require('image-data-uri');
const { uploadFileToS3, downloadFromS3 } = require('../helpers/awsUtils');
const QuestionPaper = require('../models/QuestionPaperModel');
const { titleCase } = require('../helpers/functions');
const logger = require('../helpers/winston');

const fonts = {
  Roboto: {
    normal: 'fonts/Roboto/Roboto-Regular.ttf',
    bold: 'fonts/Roboto/Roboto-Medium.ttf',
    italics: 'fonts/Roboto/Roboto-Italic.ttf',
    bolditalics: 'fonts/Roboto/Roboto-MediumItalic.ttf',
  },
  Kannada: {
    normal: 'fonts/Noto_Serif_kannada/static/NotoSeriffKannada-Thin.ttf',
    bold: 'fonts/Noto_Serif_kannada/static/NotoSeriffKannada-ExtraLight.ttf',
    italics: 'fonts/Noto_Serif_kannada/static/NotoSeriffKannada-Thin.ttf',
    bolditalics: 'fonts/Noto_Serif_kannada/static/NotoSeriffKannada-ExtraLight.ttf',
  },
  Hindi: {
    normal: 'fonts/Tiro_Devanagari_Hindi/TiroDevanagariHindi-Regular.ttf',
    bold: 'fonts/Noto_Serif_kannada/static/TiroDevanagariHindi-Regular.ttf',
    italics: 'fonts/Noto_Serif_kannada/static/TiroDevanagariHindi-Italic.ttf',
    bolditalics: 'fonts/Noto_Serif_kannada/static/TiroDevanagariHindi-Italic.ttf',
  },
};

const GeneratePDF = async (id) => {
  const paperData = await QuestionPaper.findById(id);
  const {
    questionList: pdfData,
    standard,
    subject,
    board,
    instituteName,
    examType,
    instructions,
    time,
    quesDiffDetails,
    name,
  } = paperData;

  let totalMarks = 0;
  pdfData.forEach((ques) => {
    totalMarks += quesDiffDetails[titleCase(ques.difficulty)].marks;
  });
  const indexing = ['A', 'B', 'C', 'D'];

  const newPdfData = await Promise.all(
    pdfData.map(async (item) => {
      if (
        Object.prototype.hasOwnProperty.call(item, 'imageKey') &&
        item.imageKey !== null
      ) {
        const imageurl = downloadFromS3(item.imageKey);
        const final = await imageDataURI.encodeFromURL(imageurl);
        return { ...item, imageUrl: final };
      }
      return item;
    }),
  );

  const quesPaper = {
    background(currentPage, pageSize) {
      return [
        {
          canvas: [
            { type: 'line', x1: 5, y1: 5, x2: 590, y2: 5, lineWidth: 2 }, // Up line
            { type: 'line', x1: 5, y1: 5, x2: 5, y2: 835, lineWidth: 2 }, // Left line
            { type: 'line', x1: 5, y1: 835, x2: 590, y2: 835, lineWidth: 2 }, // Bottom line
            { type: 'line', x1: 590, y1: 5, x2: 590, y2: 835, lineWidth: 2 }, // Rigth line
          ],
        },
      ];
    },
    content: [
      ...(instituteName.length > 1
        ? [
          {
            alignment: 'center',
            text: `${instituteName.toUpperCase()}\n\n`,
            style: 'header',
            bold: true,
            fontSize: 20,
            margin: [0, 0, 0, -16],
          },
        ]
        : []),
      ...(examType.length > 1
        ? [
          {
            alignment: 'center',
            text: `${examType}\n\n`,
            style: 'header',
            bold: true,
            margin: [0, 0, 0, -10],
          },
        ]
        : []),
      {
        alignment: 'center',
        style: 'header',
        bold: true,
        text: `${board} - Class ${standard === '10' ? 'X' : 'XII'}`,
        margin: [0, 0, 0, 4],
      },
      {
        alignment: 'center',
        style: 'header',
        bold: true,
        text: `${subject.toUpperCase()}\n\n`,
        margin: [0, 0, 0, 7],
      },
      {
        columns: [
          { text: `Time - ${time} mins` },
          { text: `Maximum Marks : ${totalMarks}`, alignment: 'right' },
        ],
        margin: [0, 0, 0, 6],
        bold: true,
      },
      {
        stack: [
          { text: 'General Instructions:', bold: true, italics: false },
          `${JSON.parse(instructions)}`,
          // '1. The Question Paper contains three sections',
          // '2. The first section contains the general JSON.parse(instructions)',
          // '3. The second section contains the questions',
          // '4. The third section contains the answers',
          // 'All Questions carry equal marks',
          // 'There is no negative marking',
        ],
        style: 'superMargin',
        italics: true,
        margin: [0, 12, 2, 20],
      },
      newPdfData.map((item, index) => ({
        stack: [
          {
            text: `Q${index + 1}. ${item.question}`,
            bold: true,
            margin: [0, 0, 0, 7],
          },
          Object.prototype.hasOwnProperty.call(item, 'imageKey') &&
          item.imageKey !== null
            ? {
              image: item.imageUrl,
              width: 200,
              height: 100,
              margin: [0, 4, 0, 12],
              alignment: 'center',
            }
            : ' ',
          item.options.map((option, i) => ({
            text: `${indexing[i]}. ${option}`,
            margin: [0, 0, 0, 5],
          })),
          { text: ' ', margin: [0, 0, 0, 7] },
        ],
      })),
    ],
  };

  const answerkey = {
    background(currentPage, pageSize) {
      return [
        {
          canvas: [
            { type: 'line', x1: 5, y1: 5, x2: 590, y2: 5, lineWidth: 2 }, // Up line
            { type: 'line', x1: 5, y1: 5, x2: 5, y2: 835, lineWidth: 2 }, // Left line
            { type: 'line', x1: 5, y1: 835, x2: 590, y2: 835, lineWidth: 2 }, // Bottom line
            { type: 'line', x1: 590, y1: 5, x2: 590, y2: 835, lineWidth: 2 }, // Rigth line
          ],
        },
      ];
    },
    content: [
      {
        alignment: 'center',
        style: 'header',
        bold: true,
        text: `${name}`,
        margin: [0, 0, 0, 6],
        fontSize: 15,
      },
      {
        alignment: 'center',
        style: 'header',
        bold: true,
        text: 'Answer Key',
        margin: [0, 0, 0, 15],
      },
      newPdfData.map((item, index) => ({
        text: `${index + 1}. ${item.answer}`,
        margin: [0, 0, 0, 4],
      })),
    ],
  };

  const questionKeyId = `${id.toString()}question`;
  const answerKeyId = `${id.toString()}answer`;
  const pdfmake = new PdfMake(fonts);
  const questionPdf = pdfmake.createPdfKitDocument(quesPaper);
  const questionChunks = [];

  questionPdf.on('data', (chunk) => {
    questionChunks.push(chunk);
  });

  questionPdf.on('end', async () => {
    const questionBuffer = Buffer.concat(questionChunks);
    await uploadFileToS3(questionBuffer, questionKeyId, 'application/pdf');
  });

  questionPdf.end();

  const answerPdf = pdfmake.createPdfKitDocument(answerkey);
  const answerChunks = [];

  answerPdf.on('data', (chunk) => {
    answerChunks.push(chunk);
  });

  answerPdf.on('end', async () => {
    const answerBuffer = Buffer.concat(answerChunks);
    await uploadFileToS3(answerBuffer, answerKeyId, 'application/pdf');
  });

  answerPdf.end();
  return { id, questionKey: questionKeyId, answerKey: answerKeyId };
};

const PdfProcess = async (job, done) => {
  try {
    const result = await GeneratePDF(job.data);
    done(null, result);
  } catch (err) {
    logger.error('Error', err);
  }
};

module.exports = { PdfProcess };
