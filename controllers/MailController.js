const apiResponse = require('../helpers/apiResponse');
const logger = require('../helpers/winston');
const email = require('../helpers/mailUtil');
const User = require('../models/UserModel');

const RequestContributions = async (req, res, next) => {
  try {
    const { topic, subject, standard, board } = req.query;
    const users = (await User.find({})).map((user) => user.email);
    const mailOptions = {
      from: '"EnormoQB" <enormoqb@gmail.com>',
      to: users.toString(),
      subject: 'We\'re waiting for your contribution!',
      html: `<!DOCTYPE html><html lang="en"> <head> <meta http-equiv="Content-type" content="text/html; charset=utf-8" /> <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" /> <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <meta name="format-detection" content="date=no" /> <meta name="format-detection" content="address=no" /> <meta name="format-detection" content="telephone=no" /> <meta name="x-apple-disable-message-reformatting" /> <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,300;0,400;0,500;0,600;0,700;0,900;1,400&display=swap" rel="stylesheet" /> <style type="text/css" media="screen"> /* Linked Styles */ body { padding: 0 !important; margin: 0 !important; display: block !important; min-width: 100% !important; width: 100% !important; background: #f4f4f4; -webkit-text-size-adjust: none; } a { text-decoration: none; } p { padding: 0 !important; margin: 0 !important; } img { -ms-interpolation-mode: bicubic; /* Allow smoother rendering of resized image in Internet Explorer */ } .mcnPreviewText { display: none !important; } /* Mobile styles */ @media only screen and (max-device-width: 480px), only screen and (max-width: 480px) { u + .body .gwfw { width: 100% !important; width: 100vw !important; } .m-shell { width: 100% !important; min-width: 100% !important; } .m-center { text-align: center !important; } .center { margin: 0 auto !important; } .nav { text-align: center !important; } .text-top { line-height: 22px !important; } .td { width: 100% !important; min-width: 100% !important; } .bg { height: auto !important; -webkit-background-size: cover !important; background-size: cover !important; } .m-br-15 { height: 15px !important; } .p30-15 { padding: 30px 15px !important; } .p0-15-30 { padding: 30px !important; } .pb40 { padding-bottom: 40px !important; } .pb0 { padding-bottom: 0px !important; } .pb20 { padding-bottom: 20px !important; } .m-td, .m-hide { display: none !important; width: 0 !important; height: 0 !important; font-size: 0 !important; line-height: 0 !important; min-height: 0 !important; } .m-height { height: auto !important; } .m-block { display: block !important; } .fluid-img img { width: 100% !important; max-width: 100% !important; height: auto !important; } .column, .column-top, .column-dir, .column-bottom, .column-dir-top, .column-dir-bottom { float: left !important; width: 100% !important; display: block !important; } .content-spacing { width: 15px !important; } } </style> </head> <body class="body" style=" padding: 0 !important; margin: 0 !important; display: block !important; min-width: 100% !important; width: 100% !important; background: #ffffff; -webkit-text-size-adjust: none; " > <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" class="gwfw" > <tr> <td align="center" valign="top"> <!-- Main --> <table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr> <td align="center" class="pb0"> <!-- Shell --> <table width="650" border="0" cellspacing="0" cellpadding="0" class="m-shell" > <tr> <td class="td" style=" width: 650px; min-width: 650px; font-size: 0pt; line-height: 0pt; padding: 0; margin: 0; font-weight: normal; " > <!-- Header --> <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#C3D0F9" > <tr> <td style="padding: 20px 40px"> <table width="100%" border="0" cellspacing="0" cellpadding="0" > <tr> <th class="column" width="118" style=" font-size: 0pt; line-height: 0pt; padding: 0; margin: 0; font-weight: normal; " > <table width="100%" border="0" cellspacing="0" cellpadding="0" > <tr> <td class="img m-center" style=" font-size: 0pt; line-height: 0pt; text-align: left; " > <a href="https://enormoqb.tech/" target="_blank" ><img src="https://firebasestorage.googleapis.com/v0/b/enormoqb.appspot.com/o/images%2FmainLogo.png?alt=media&token=1dc604aa-dfb3-476e-9572-08ebed67efb7" height="38" border="0" alt="" /></a> </td> </tr> </table> </th> </tr> </table> </td> </tr> </table> <!-- END Header --> <!-- Content / Title + Copy + Button --> <div mc:repeatable="Select" mc:variant="Content / Title + Copy + Button" > <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F9FBFF" > <tr> <td style="padding: 20px 40px 40px 40px" class="p0-15-30" > <table width="100%" border="0" cellspacing="0" cellpadding="0" > <tr> <td class="h3 center" style=" padding-bottom: 10px; color: #1b1c1e; font-family: 'Poppins', Arial, sans-serif; font-size: 16px; line-height: 30px; " > Dear User, </td> </tr> <tr> <td class="text center" style=" padding-bottom: 26px; color: #1b1c1e; font-family: 'Poppins', Arial, sans-serif; font-size: 16px; line-height: 30px; min-width: auto !important; " > EnormoQB invites you to contribute questions on the topic "${topic}" of subject "${subject}" belonging to grade "${standard}th" of the "${board}" board. </td> </tr> <tr> <td> <table class="center" border="0" cellspacing="0" cellpadding="0" style="text-align: center" > <tr> <td class="text-button text-button-white" style=" color: #ffffff; background: #005ce6; border-radius: 5px; font-family: 'Poppins', Arial, sans-serif; font-size: 16px; line-height: 18px; text-align: center; font-weight: 400; padding: 12px 25px; " > <a href="https://enormoqb.tech/" target="_blank" class="link-white" style=" color: #ffffff; text-decoration: none; " ><span class="link-white" style=" color: #ffffff; text-decoration: none; " >Contribute</span ></a > </td> </tr> </table> </td> </tr> </table> </td> </tr> </table> </div> <!-- END Purple Content / Title + Copy + Button --> <!-- Article Image On The Left --> <div mc:repeatable="Select" mc:variant="Article Image On The Left" > <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F9FBFF" > <tr> <td style="padding: 0px 40px 40px 40px" class="p0-15-30" > <table width="100%" border="0" cellspacing="0" cellpadding="0" > <tr> <th class="column" width="260" style=" font-size: 0pt; line-height: 0pt; padding: 0; margin: 0; font-weight: normal; " > <table width="100%" border="0" cellspacing="0" cellpadding="0" > <tr> <td class="fluid-img" style=" font-size: 0pt; line-height: 0pt; text-align: left; border-radius: 5px; " bgcolor="#DEE3F5" > <a href="https://enormoqb.tech/" target="_blank" ><img src="https://firebasestorage.googleapis.com/v0/b/enormoqb.appspot.com/o/images%2FsetPaper.png?alt=media&token=023cf789-d7d5-4099-8c8f-72bb1440031e" width="260" border="0" alt="" /></a> </td> </tr> </table> </th> <th style=" padding-bottom: 20px !important; font-size: 0pt; line-height: 0pt; padding: 0; margin: 0; font-weight: normal; " class="column" width="60" ></th> <th class="column" style=" font-size: 0pt; line-height: 0pt; padding: 0; margin: 0; font-weight: normal; " > <table width="100%" border="0" cellspacing="0" cellpadding="0" > <tr> <td class="h2" style=" padding-bottom: 20px; color: #1b1c1e; font-family: 'Poppins', Arial, sans-serif; font-size: 24px; line-height: 46px; text-align: left; font-weight: 400; " > Setting Question <span class="m-hide"><br /></span> Papers. <span style="color: #005ce6" >Simplified.</span > </td> </tr> <tr> <td align="left"> <table border="0" cellspacing="0" cellpadding="0" > <tr> <td class="text-button" style=" color: #f9fbff; background: #005ce6; border-radius: 5px; font-family: 'Poppins', Arial, sans-serif; font-size: 16px; line-height: 18px; text-align: center; font-weight: 400; padding: 12px 25px; " > <a href="https://enormoqb.tech/" target="_blank" class="link-white" style=" color: #ffffff; text-decoration: none; " ><span class="link-white" style=" color: #ffffff; text-decoration: none; " >Visit EnormoQB</span ></a > </td> </tr> </table> </td> </tr> </table> </th> </tr> </table> </td> </tr> </table> </div> <!-- END Article Image On The Left --> <!-- Footer --> <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#C3D0F9" > <tr> <td style=" padding: 20px 40px; border-top: 3px solid #f4f4f4; " class="p30-15" > <table width="100%" border="0" cellspacing="0" cellpadding="0" > <tr> <td> <table width="100%" border="0" cellspacing="0" cellpadding="0" > <tr> <th class="column" style=" font-size: 0pt; line-height: 0pt; padding: 0; margin: 0; font-weight: normal; " > <table width="100%" border="0" cellspacing="0" cellpadding="0" > <tr> <td align="center"> <table class="center" border="0" cellspacing="0" cellpadding="0" style="text-align: center" > <tr> <td class="img" width="30" style=" font-size: 0pt; line-height: 0pt; text-align: left; " > <a href="https://enormoqb.tech/" target="_blank" ><img src="https://firebasestorage.googleapis.com/v0/b/enormoqb.appspot.com/o/images%2Ffacebook-app-symbol.png?alt=media&token=ae1c5efd-6641-426b-bc06-effa195fd27e" height="18" border="0" alt="" /></a> </td> <td class="img" width="40" style=" font-size: 0pt; line-height: 0pt; text-align: left; " > <a href="https://enormoqb.tech/" target="_blank" ><img src="https://firebasestorage.googleapis.com/v0/b/enormoqb.appspot.com/o/images%2Ftwitter.png?alt=media&token=a36b2215-24df-49e1-aaa5-07122af6b8e9" height="18" border="0" alt="" /></a> </td> <td class="img" width="40" style=" font-size: 0pt; line-height: 0pt; text-align: left; " > <a href="https://enormoqb.tech/" target="_blank" ><img src="https://firebasestorage.googleapis.com/v0/b/enormoqb.appspot.com/o/images%2Finstagram.png?alt=media&token=23b128cc-e300-47ac-a21b-7c7afc72a62b" height="18" border="0" alt="" /></a> </td> <td class="img" style=" font-size: 0pt; line-height: 0pt; text-align: left; " > <a href="https://enormoqb.tech/" target="_blank" ><img src="https://firebasestorage.googleapis.com/v0/b/enormoqb.appspot.com/o/images%2Flinkedin.png?alt=media&token=6c5ebe86-ed9d-4f97-a8b1-8ede0cb68094" height="18" border="0" alt="" /></a> </td> </tr> </table> </td> </tr> </table> </th> </tr> </table> </td> </tr> </table> </td> </tr> </table> <!-- END Footer --> </td> </tr> </table> <!-- END Shell --> </td> </tr> </table> <!-- END Main --> </td> </tr> </table> </body></html>`,
    };

    await email(mailOptions);
    apiResponse.successResponseWithData(res, 'Success');
  } catch (error) {
    logger.error('Error :', error);
    apiResponse.ErrorResponse(res, error);
    next(error);
  }
};

module.exports = { RequestContributions };
