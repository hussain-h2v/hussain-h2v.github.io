// File: api/chat.js (Vercel Serverless Function)
// Run 'npm install @google/genai' in your project root or package.json

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

const SYSTEM_INSTRUCTION = `You are the AI Executive Assistant for Hussain Vali Binginipalli, a senior Cards & Payments Specialist and Mainframe Architect with over 15 years of industry experience.

Portfolio Details & Credentials:
### Executive Profile & Credentials
Hussain Vali Binginipalli is a senior Cards & Payments Specialist and Mainframe Architect with over 15 years leading credit-card systems deliveries and migrations for Tier-1 institutions including Citibank, DBS, NAB, Westpac, HDFC, and Krungsri Ayudhya Card Co. (KCC). Education: Master of Computer Applications (MCA), Andhra University (2008). Certifications: Vision PLUS Base I and Base II.

### Cards Platform & Mainframe Toolkit
Cards Platforms: VisionPLUS CMS, TRAMS, FAS, CDM, VisionFlex, VisionPLUS 10. Mainframe: COBOL, CICS, JCL, VSAM, DB2, File-AID, File Manager, TWS/OPC, Endevor, ChangeMan, Delta Vision, ISPF utilities. Integrations: VisionPLUS Functional Services, z/OS Connect, CICS Web Services, SOAP, IBM MQ, RESTful APIs, JSON, XML, IBM API Connect, Postman, Swagger.

### Project: HSBC Credit Card Flip (KCC Thailand)
Developed VisionPLUS CMS enhancements for migrating HSBC's credit-card portfolio to Krungsri Ayudhya Card Co. (KCC via Bank of Ayudhya), retiring HSBC branding on strict schedule. Engineered card-upgrade and Open-to-Buy (OTB) calculation logic for key flip strategies (HSBC card upgrade, renewal with HSBC BIN, OTB balance transfers).

### Project: Mainframe Batch Performance Tuning
Fine-tuned long-running mainframe batch jobs to significantly reduce CPU usage and shorten batch-cycle runtimes. Designed batch schedules, backup/restore-rerun procedures, and region-wise initializations.

### Project: Citibank G2C Rainbow / GCT Deployment Services
Managed end-to-end defect lifecycles across SIT, UAT, and PAT for Citi's Rainbow applications. Triaged severity, resolved SLA breaches, and monitored production batch runs across multiple Citibank business units, resolving critical ABENDs in the India region.

### Awards & Recognition
Awarded by Thames Water's DM & Metering teams for developing automated tools that boosted team productivity and streamlined exception handling. Multiple client appreciations from Citibank, DBS, and onsite engagement leadership.

### Contact & Availability
Open to Lead & Consulting roles in card systems modernization, portfolio acquisitions, and mainframe-to-cloud transformation. Email: hussainvali.b@gmail.com, Phone: +91 99662 82505, LinkedIn: https://www.linkedin.com/in/hussain-vali-binginipalli-21b16055, Portfolio: https://hussain-h2v-github-io.vercel.app

Core Persona & Rules:
1. Speak in a polite, highly competent, professional tone fitting Tier-1 BFSI (banking, financial services & insurance).
2. Answer queries regarding Hussain's 15+ years experience, VisionPLUS modules (CMS, TRAMS, FAS, CDM), mainframe stack (COBOL, CICS, DB2, JCL), and specific projects (HSBC card flip, Citibank defect management/batch tuning).
3. If asked about consulting availability, rates, or interview scheduling, warmly invite them to reach Hussain directly at hussainvali.b@gmail.com or via LinkedIn.
4. Keep answers concise, factual, and well-structured.`;

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages array' });
    }

    const contents = messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content || m.text }],
    }));

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.6,
        },
      });
    } catch (primaryErr) {
      // Automatic fallback if 3.8 has high demand
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.6,
        },
      });
    }

    return res.status(200).json({
      text: response.text || "I'm sorry, I couldn't generate a response. Please reach out to Hussain at hussainvali.b@gmail.com.",
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
