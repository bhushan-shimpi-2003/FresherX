import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import * as FileSystem from 'expo-file-system';
import { ResumeData } from '../store/resume.store';

export const generateResumePDF = async (data: ResumeData) => {
  const formatDesc = (desc: string) => {
    if (!desc) return '';
    const lines = desc.split('\n').filter(l => l.trim());
    if (lines.length === 1 && !lines[0].trim().startsWith('-')) {
      return `<div class="item-desc">${lines[0]}</div>`;
    }
    return `<ul class="item-desc">
      ${lines.map(line => `<li>${line.replace(/^[-*•]\s*/, '').trim()}</li>`).join('')}
    </ul>`;
  };

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
            padding: 40px 50px;
          }
          h1 {
            font-size: 28pt;
            margin: 0 0 10px 0;
            text-align: center;
            text-transform: uppercase;
            font-weight: bold;
            letter-spacing: 1px;
          }
          .contact-info {
            text-align: center;
            font-size: 10pt;
            margin-bottom: 25px;
            color: #333;
          }
          .contact-info a {
            color: #333;
            text-decoration: none;
          }
          h2 {
            font-size: 13pt;
            border-bottom: 2px solid #000;
            padding-bottom: 4px;
            margin-top: 20px;
            margin-bottom: 12px;
            text-transform: uppercase;
            font-weight: bold;
          }
          .section {
            margin-bottom: 15px;
          }
          .item {
            margin-bottom: 16px;
          }
          .item-header {
            font-weight: bold;
            font-size: 12pt;
            margin-bottom: 2px;
          }
          .item-subheader {
            font-size: 11pt;
            margin-bottom: 4px;
          }
          .right {
            float: right;
            font-weight: bold;
          }
          .item-desc {
            margin-top: 6px;
            margin-bottom: 0;
            padding-left: 20px;
          }
          li {
            margin-bottom: 4px;
          }
          .clear {
            clear: both;
          }
          .skills-text {
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <h1>${data.fullName}</h1>
        <div class="contact-info">
          ${[data.location, data.email, data.phone, data.linkedin, data.portfolio].filter(Boolean).join(' | ')}
        </div>

        ${data.summary ? `
          <h2>Professional Summary</h2>
          <div class="section">${data.summary}</div>
        ` : ''}

        ${data.experience?.length > 0 ? `
          <h2>Work Experience</h2>
          <div class="section">
            ${data.experience.map(exp => `
              <div class="item">
                <div class="item-header">
                  ${exp.role}
                </div>
                <div class="item-subheader">
                  ${exp.company} <span class="right">${exp.duration}</span>
                </div>
                ${formatDesc(exp.description)}
                <div class="clear"></div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${data.education?.length > 0 ? `
          <h2>Education</h2>
          <div class="section">
            ${data.education.map(edu => `
              <div class="item">
                <div class="item-header">
                  ${edu.degree}
                </div>
                <div class="item-subheader">
                  ${edu.institution} <span class="right">${edu.year}</span>
                </div>
                ${edu.score ? `<div class="item-desc">Score: ${edu.score}</div>` : ''}
                <div class="clear"></div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${data.skills ? `
          <h2>Skills</h2>
          <div class="section skills-text">
            ${data.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => `• ${s}`).join(' &nbsp;&nbsp;&nbsp; ')}
          </div>
        ` : ''}

        ${data.projects?.length > 0 ? `
          <h2>Projects</h2>
          <div class="section">
            ${data.projects.map(proj => `
              <div class="item">
                <div class="item-header">
                  ${proj.name} ${proj.link ? `| <a href="${proj.link}" style="font-size: 10pt; font-weight: normal; color: #666;">${proj.link}</a>` : ''}
                </div>
                ${formatDesc(proj.description)}
                <div class="clear"></div>
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
                  ${cert.name}
                </div>
                <div class="item-subheader">
                  ${cert.issuer} <span class="right">${cert.year}</span>
                </div>
                <div class="clear"></div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${data.hobbies ? `
          <h2>Hobbies</h2>
          <div class="section skills-text">
            ${data.hobbies.split(',').map(s => s.trim()).filter(Boolean).map(s => `• ${s}`).join(' &nbsp;&nbsp;&nbsp; ')}
          </div>
        ` : ''}
      </body>
    </html>
  `;

  try {
    if (Platform.OS === 'web') {
      // On web, printToFileAsync is not supported and prints the main screen.
      // We must use printAsync with the html property which opens an iframe to print the document.
      await Print.printAsync({ html });
    } else {
      // On native, we generate a file first
      const result = await Print.printToFileAsync({
        html,
        base64: false
      });
      
      if (result?.uri) {
        if (Platform.OS === 'android') {
          try {
            // Get content URI from file URI for Android intent
            const contentUri = await FileSystem.getContentUriAsync(result.uri);
            await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
              data: contentUri,
              flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
              type: 'application/pdf'
            });
          } catch (e) {
            console.log('IntentLauncher failed, falling back to Sharing', e);
            // Fallback to sharing if intent launcher fails (e.g., no PDF viewer installed)
            await Sharing.shareAsync(result.uri, {
              mimeType: 'application/pdf',
              dialogTitle: 'Download Resume',
              UTI: 'com.adobe.pdf'
            });
          }
        } else {
          // On iOS, Sharing.shareAsync automatically displays a full-screen PDF preview.
          await Sharing.shareAsync(result.uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Download Resume',
            UTI: 'com.adobe.pdf'
          });
        }
      }
    }
  } catch (err) {
    console.error('Failed to generate or share PDF', err);
    throw err;
  }
};
