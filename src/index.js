export default {
	async fetch(request, env, ctx) { // ctx is the execution context
	  const setCorsHeaders = () => ({
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
	  });
  
	  if (request.method === 'OPTIONS') {
		return new Response(null, { status: 204, headers: setCorsHeaders() });
	  }
  
	  try {
		const formData = await request.json();
		const apiKey = 'api-E590F5313DC444E7AC02A68775937CF8';
  
		// Write to KV Store FIRST
		const leadKey = `lead_${Date.now()}`;
		await env.Leads.put(leadKey, JSON.stringify(formData));
  
		// Respond to client immediately after KV write
		const response = new Response(
		  JSON.stringify({ message: 'Lead saved successfully. Emails will be sent.' }),
		  { status: 200, headers: { 'Content-Type': 'application/json', ...setCorsHeaders() } }
		);
  
		// Background task: Send emails
		ctx.waitUntil( // Use ctx.waitUntil here
		  (async () => {
			const capitalizedFirstName =
			  formData.firstName.charAt(0).toUpperCase() + formData.firstName.slice(1).toLowerCase();
  
			const adminSubject = 'New Client Lead';
			const adminBody = `
			  <p>You have a new client lead:</p>
			  <ul>
				<li><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</li>
				<li><strong>Email:</strong> ${formData.email}</li>
				<li><strong>Phone:</strong> ${formData.phone}</li>
			  </ul>
			`;
  
			const userSubject = 'Welcome to Maple Jiu-Jitsu';
			const userBody = `
			  <p>Hello ${capitalizedFirstName},</p>
			  <p>Thank you for your interest...</p>
			`;
  
			async function sendEmail(to, subject, htmlBody) {
			  const emailData = {
				api_key: apiKey,
				to: [to],
				sender: '"Maple Jiu-Jitsu" <admin@maplebjj.com>',
				subject: subject,
				html_body: htmlBody,
			  };
  
			  await fetch('https://api.smtp2go.com/v3/email/send', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(emailData),
			  });
			}
  
			// Send both emails
			await Promise.all([
			  sendEmail('admin@maplebjj.com', adminSubject, adminBody),
			  sendEmail(formData.email, userSubject, userBody),
			]);
  
			console.log('Emails sent successfully');
		  })()
		);
  
		return response; // Respond to the client
	  } catch (error) {
		console.error('Error:', error);
		const response = new Response('Server error', { status: 500 });
		Object.entries(setCorsHeaders()).forEach(([key, value]) =>
		  response.headers.set(key, value)
		);
		return response;
	  }
	},
  };
  