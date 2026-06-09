import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { ResumeData } from '../store/resume.store';

export const generateResumePDF = async (data: ResumeData) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #000;
            margin: 0;
            padding: 40px;
          }
          h1 {
            font-size: 24pt;
            margin: 0 0 5px 0;
            text-align: center;
          }
          .contact-info {
            text-align: center;
            font-size: 10pt;
            margin-bottom: 20px;
          }
          .contact-info a {
            color: #000;
            text-decoration: none;
          }
          h2 {
            font-size: 14pt;
            border-bottom: 1px solid #000;
            padding-bottom: 3px;
            margin-top: 15px;
            margin-bottom: 10px;
            text-transform: uppercase;
          }
          .section {
            margin-bottom: 15px;
          }
          .item {
            margin-bottom: 10px;
          }
          .item-header {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
          }
          .item-subheader {
            display: flex;
            justify-content: space-between;
            font-style: italic;
          }
          .item-desc {
            margin-top: 5px;
          }
        </style>
      </head>
      <body>
        <h1>${data.fullName}</h1>
        <div class="contact-info">
          ${data.email} | ${data.phone} | ${data.location} <br/>
          ${data.linkedin} | ${data.portfolio}
        </div>

        ${data.summary ? `
          <h2>Professional Summary</h2>
          <div class="section">${data.summary}</div>
        ` : ''}

        ${data.skills ? `
          <h2>Skills</h2>
          <div class="section">${data.skills}</div>
        ` : ''}

        ${data.experience.length > 0 ? `
          <h2>Experience</h2>
          <div class="section">
            ${data.experience.map(exp => `
              <div class="item">
                <div class="item-header">
                  <span>${exp.role}</span>
                  <span>${exp.duration}</span>
                </div>
                <div class="item-subheader">
                  <span>${exp.company}</span>
                </div>
                <div class="item-desc">${exp.description}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${data.education.length > 0 ? `
          <h2>Education</h2>
          <div class="section">
            ${data.education.map(edu => `
              <div class="item">
                <div class="item-header">
                  <span>${edu.degree}</span>
                  <span>${edu.year}</span>
                </div>
                <div class="item-subheader">
                  <span>${edu.institution}</span>
                  <span>Score: ${edu.score}</span>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${data.projects.length > 0 ? `
          <h2>Projects</h2>
          <div class="section">
            ${data.projects.map(proj => `
              <div class="item">
                <div class="item-header">
                  <span>${proj.name} ${proj.link ? `| <a href="${proj.link}">${proj.link}</a>` : ''}</span>
                </div>
                <div class="item-desc">${proj.description}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${data.certifications?.length > 0 ? `
          <h2>Certifications</h2>
          <div class="section">
            ${data.certifications.map(cert => `
              <div class="item">
                <div class="item-header">
                  <span>${cert.name}</span>
                  <span>${cert.year}</span>
                </div>
                <div class="item-subheader">
                  <span>${cert.issuer}</span>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${data.hobbies ? `
          <h2>Hobbies</h2>
          <div class="section">${data.hobbies}</div>
        ` : ''}
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false
    });
    
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Download Resume',
      UTI: 'com.adobe.pdf'
    });
  } catch (err) {
    console.error('Failed to generate or share PDF', err);
    throw err;
  }
};
