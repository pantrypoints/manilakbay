import type { RequestHandler } from '@sveltejs/kit';
import { json, error } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		
		// Generate a unique submission ID
		const submissionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		
		const form = new FormData();
		form.append('name', body.name || 'anonymous');
		form.append('subj', body.type || '');
		form.append('city', String(body.lat));
		form.append('country', String(body.lng));
		form.append('source', 'manilakbay');
		form.append('lang', 'en');
		// Make email truly unique with coordinates and timestamp
		form.append('email', `submission.${body.lat}.${body.lng}.${submissionId}@manilakbay.local`);
		
		// Optionally add a unique identifier in another field if the API supports it
		form.append('id', submissionId);

		console.log('Sending to external API:', {
			name: form.get('name'),
			subj: form.get('subj'),
			city: form.get('city'),
			country: form.get('country'),
			email: form.get('email'),
			id: form.get('id')
		});

		const res = await fetch('https://pantrypoints.com/api/external', {
			method: 'POST',
			body: form,
			// Don't set Content-Type header - let browser set it with boundary for FormData
		});

		const text = await res.text();
		console.log('External API response status:', res.status);
		console.log('External API response:', text);

		// Handle 409 Conflict - this might mean the location already exists
		if (res.status === 409) {
			// Return success anyway since the data might already be there
			return json({ 
				ok: true, 
				message: 'Location already reported or is being processed',
				status: 'duplicate'
			});
		}

		if (!res.ok) {
			throw error(res.status, `External API error: ${text}`);
		}

		// Try to parse response as JSON
		let data;
		try {
			data = JSON.parse(text);
		} catch {
			data = { ok: true, message: 'Submitted successfully' };
		}

		return json(data);
	} catch (e: any) {
		console.error('Error in /api/report:', e);
		throw error(e.status || 500, e.body?.message || e.message || 'Internal server error');
	}
};