const axios = require('axios');

exports.handler = async (event, context) => {

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status: "fail",
        message: "Method Not Allowed"
      })
    };
  }

  try {

    const { username, password } =
      JSON.parse(event.body);

    const response = await axios.post(
      "https://books-foods-airports-arch.trycloudflare.com/auth",
      {
        username,
        password
      },
      {
        timeout: 5000
      }
    );

    return {

      statusCode: 200,

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        status: "success",
        message: "FreeIPA 인증 완료",
        user: username,
        data: response.data
      })
    };

  } catch (error) {

    console.error(error.message);

    return {

      statusCode:
        error.response?.status || 500,

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        status: "fail",
        message:
          error.response?.data?.message ||
          error.message ||
          "server error"
      })
    };
  }
};