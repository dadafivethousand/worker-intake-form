export default {
	async fetch(request) {
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
		const apiKey = 'api-E590F5313DC444E7AC02A68775937CF8'; // Replace with your SMTP2GO API key
  
		// Helper function to send email
		async function sendEmail(to, subject, htmlBody) {
		  const emailData = {
			api_key: apiKey,
			to: [to],
			sender: '"Maple Jiu-Jitsu" <admin@maplebjj.com>',
			subject: subject,
			html_body: htmlBody, // Using HTML for emails
		  };
  
		  const response = await fetch('https://api.smtp2go.com/v3/email/send', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(emailData),
		  });
  
		  const result = await response.json();
		  return result.data && result.data.error === 'SUCCESS';
		}
  
  
		// Helper function to capitalize the first letter of a name
  
  
  
		// Email to Admin
		const adminSubject = 'New Client Lead';
		const adminBody = `
		  <p>You have a new client lead:</p>
		  <ul>
			<li><strong>Name:</strong> ${formData.firstName}</li>
			<li><strong>Name:</strong> ${formData.lastName}</li>
			<li><strong>Email:</strong> ${formData.email}</li>
			<li><strong>Phone:</strong> ${formData.phone}</li>
		  </ul>
		`;
		await sendEmail('admin@maplebjj.com', adminSubject, adminBody);
  
		function capitalizeName(name) {
		  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
		}
		
  
		const capitalizedFirstName = capitalizeName(formData.firstName);
  
		// Email to User with Signature
		const userSubject = 'Welcome to Maple Jiu-Jitsu';
		const userBody = `
		<p>Hello ${capitalizedFirstName},</p>
		  <p>Thank you for your interest in our academy. Please feel free to attend any classes you see listed on our schedule, which is found on our website 
		  at <a href="http://maplebjj.com">maplebjj.com</a>. Your trial will start on the day that you attend your first class and will last 7 days.</p>
		  <p>If you decide at the end of your free trial that you would like to join, you can sign up either online or in person. 
		  We won’t bother you with follow-ups after the trial because we prefer that you make the decision on your own.</p>
		  <p>Should you have any questions or concerns, please feel free to reach out to us directly.</p>
  
		  <br>
		  <div style="font-family:'Trebuchet MS',sans-serif; color:#383b3e;">
			<p>Sincerely,</p>
			<p><strong>Maple Jiu-Jitsu Academy</strong></p>
			<img src="https://i.imgur.com/b8kPby1.png" alt="Maple Jiu-Jitsu" width="96" height="43"><br>
			<p>📞 647-887-9940<br>
			✉️ <a href="mailto:admin@maplebjj.com">admin@maplebjj.com</a><br>
			🌐 <a href="http://maplebjj.com" target="_blank">Maplebjj.com</a><br>
			📍 20 Cranston Park Ave, Maple, ON L6A2G1</p>
		  </div>
		`;
		await sendEmail(formData.email, userSubject, userBody);
  
		// Response
		const response = new Response(JSON.stringify({ message: 'Emails sent successfully' }), {
		  status: 200,
		  headers: { 'Content-Type': 'application/json' },
		});
		Object.entries(setCorsHeaders()).forEach(([key, value]) => response.headers.set(key, value));
		return response;
	  } catch (error) {
		console.error('Error:', error);
		const response = new Response('Server error', { status: 500 });
		Object.entries(setCorsHeaders()).forEach(([key, value]) => response.headers.set(key, value));
		return response;
	  }
	},
  };
  