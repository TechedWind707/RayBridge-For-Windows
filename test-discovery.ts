import { discoverExtensions } from './src/discovery'
import { getOAuthTokens } from './src/auth'

async function test() {
  console.log('Discovering extensions...');
  const extensions = await discoverExtensions();
  console.log(`Found ${extensions.length} extensions:`, extensions.map(e => e.extensionName));

  console.log('\nTesting OAuth token retrieval...');
  for (const ext of extensions) {
    try {
      const tokens = await getOAuthTokens(ext.extensionName);
      console.log(`✓ ${ext.extensionName}: ${tokens ? 'has tokens' : 'no tokens'}`);
    } catch (err: any) {
      console.log(`✗ ${ext.extensionName}: ${err?.message ?? String(err)}`);
    }
  }
}

test();
