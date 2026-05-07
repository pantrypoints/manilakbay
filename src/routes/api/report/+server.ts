import type { RequestHandler } from '@sveltejs/kit';
import { json, error } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		
		// Log what we received
		console.log('Received data:', body);
		
		// Validate required fields
		if (!body.lat || !body.lng || !body.type) {
			throw error(400, 'Missing required fields: lat, lng, type');
		}

		// pantrypoints expects FormData with specific fields
		const form = new FormData();
		form.append('name', body.name || 'anonymous');
		form.append('subj', body.type);
		form.append('city', String(body.lat));
		form.append('country', String(body.lng));
		form.append('source', 'manilakbay');
		form.append('lang', 'en');
		form.append('email', 'pantrypoints@gmail.com');

		console.log('Sending to external API...');

		const res = await fetch('https://pantrypoints.com/api/external', {
			method: 'POST',
			body: form,
			headers: {
				// Don't set Content-Type for FormData - browser sets it automatically with boundary
			}
		});

		const text = await res.text();
		console.log('External API response status:', res.status);
		console.log('External API response:', text);

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