import app from '../hono/hono';
import telegramService from '../service/telegram-service';
import result from '../model/result';

app.get('/telegram/getEmail/:token', async (c) => {
	const content = await telegramService.getEmailContent(c, c.req.param());
	c.header('Cache-Control', 'public, max-age=604800, immutable');
	return c.html(content)
});

app.post('/telegram/translate', async (c) => {
	try {
		const { text, targetLang } = await c.req.json();

		if (!text || !targetLang) {
			return c.json(result.fail('缺少必要参数'));
		}

		const translatedText = await telegramService.translateText(c, text, targetLang);

		return c.json(result.ok({ translatedText }));
	} catch (error) {
		console.error('翻译API错误:', error);
		return c.json(result.fail(error.message || '翻译失败'));
	}
});

// 测试翻译功能的端点
app.get('/telegram/test-translate', async (c) => {
	try {
		const testText = "Hello, this is a test message. How are you today?";
		const targetLang = "zh";

		console.log('[测试] 开始测试翻译功能');
		console.log('[测试] 是否有 AI 绑定:', !!c.env.AI);

		const translatedText = await telegramService.translateText(c, testText, targetLang);

		return c.json({
			success: true,
			hasAI: !!c.env.AI,
			original: testText,
			translated: translatedText,
			targetLang: targetLang
		});
	} catch (error) {
		console.error('[测试] 翻译测试失败:', error);
		return c.json({
			success: false,
			error: error.message,
			hasAI: !!c.env.AI
		});
	}
});

