const axios = require('axios');

async function testApi() {
  try {
    console.log('Testing API...');
    const response = await axios.get('http://localhost:5000/api/products');
    console.log('Status:', response.status);
    console.log('Number of products:', response.data.length);
    if (response.data.length > 0) {
      console.log('First product name:', response.data[0].name);
      console.log('First product images:', response.data[0].images);
      console.log('First image URL:', response.data[0].images[0]);
    }
  } catch (error) {
    console.error('API Test Error:', error.message);
  }
}

testApi();