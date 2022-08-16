const { Job } = require('bull');
const PdfMake = require('pdfmake');
const fs = require('fs');
const imageDataURI = require('image-data-uri');
const mongoose = require('mongoose');
const { uploadFileToS3, downloadFromS3 } = require('../helpers/awsUtils');
const QuestionPaper = require('../models/QuestionPaperModel');

const GeneratePDF = async (id) => {
  // const {
  //   standard,
  //   subject,
  //   pdfData,
  //   time,
  //   instructions,
  //   instituteName,
  //   name,
  //   quesDiffDetails } = req.body;
  const paperData = await QuestionPaper.findById(mongoose.Types.ObjectId(id));
  // eslint-disable-next-line max-len
  const { questionList: pdfData, standard, subject, board, instituteName, examType, instructions, time, quesDiffDetails, name } = paperData;
  const fonts = {
    Roboto: {
      normal: 'fonts/Roboto/Roboto-Regular.ttf',
      bold: 'fonts/Roboto/Roboto-Medium.ttf',
      italics: 'fonts/Roboto/Roboto-Italic.ttf',
      bolditalics: 'fonts/Roboto/Roboto-MediumItalic.ttf',
    },
  };
    // iterate over objects of objects quesDiffDetails to calculate marks
  let totalMarks = 0;
  Object.keys(quesDiffDetails).forEach((key) => {
    totalMarks += (quesDiffDetails[key].marks * quesDiffDetails[key].count);
  });
  const indexing = ['A', 'B', 'C', 'D'];
  const year = new Date().getFullYear();
  const newPdfData = await Promise.all(
    pdfData.map(async (item) => {
      if (item.imageKey !== null) {
        const imageurl = downloadFromS3(item.imageKey);
        const final = await imageDataURI.encodeFromURL(imageurl);
        return { ...item, imageUrl: final };
      }
      return item;
    }),
  );

  const dd = {
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
        text: `${instituteName.toUpperCase()}\n\n`,
        style: 'header',
        bold: true,
        fontSize: 20,
        margin: [0, 0, 0, -16],
      },
      {
        alignment: 'center',
        text: `Question Paper ${year}-${year + 1}\n\n`,
        style: 'header',
        bold: true,
        margin: [0, 0, 0, -10],
      },
      {
        alignment: 'center',
        style: 'header',
        bold: true,
        text: `Subject: ${subject.toUpperCase()}\n\n`,
        margin: [0, 0, 0, -10],
      },
      {
        alignment: 'center',
        style: 'header',
        bold: true,
        text: `Class - ${standard === '10' ? 'X' : 'XII'}`,
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          {
            text: `Time - ${time}mins`,
          },
          {
            text: `Maximum Marks : ${totalMarks}`,
            alignment: 'right',
          },
        ],
        margin: [10, 0, 10, 6],
        bold: true,
      },
      {
        stack: [
          {
            text: 'General Instructions',
          },
          `${instructions}`,
          '1. The Question Paper contains three sections',
          '2. The first section contains the general instructions',
          '3. The second section contains the questions',
          '4. The third section contains the answers',
          'All Questions carry equal marks',
          'There is no negative marking',
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
          {
            text: ' ',
            margin: [0, 0, 0, 7],
          },
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
  const pdfmake = new PdfMake(fonts);
  const doc = pdfmake.createPdfKitDocument(dd);
  doc.pipe(fs.createWriteStream('document.pdf'));
  doc.end();
  // const questionKeyId = `${id.toString()}questionKey`;
  // await uploadFileToS3(
  //   'document.pdf',
  //   questionKeyId,
  //   'application/pdf',
  // );
  const answerPdf = pdfmake.createPdfKitDocument(answerkey);
  answerPdf.pipe(fs.createWriteStream('answerkey.pdf'));
  answerPdf.end();
  // const answerKeyId = `${id.toString()}answerkey`;
  // await uploadFileToS3(
  //   'answerKey.pdf',
  //   answerKeyId,
  //   'application/pdf',
  // );
  return id;
};

const PdfProcess = async (job, done) => {
  try {
    GeneratePDF(job.data);
  } catch (err) {
    console.log(err);
  }
};
module.exports = { PdfProcess };
