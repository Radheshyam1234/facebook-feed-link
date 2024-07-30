const express = require("express");
const axios = require("axios");
const { Parser } = require("json2csv");

const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", async (req, res) => {
  const domainName = req?.query?.domainName;
  if (!domainName) {
    return res.status(400).send("domainName query parameter is required");
  }

  try {
    const response = await axios.get(
      `https://${domainName}/products.json?limit=250`
    );
    const productsData = response.data;

    let dataToBeExported = [];
    productsData?.products?.forEach((element) => {
      element?.variants?.forEach((ele) => {
        let item = {
          id: ele?.id,
          title: element?.title,
          description: element?.body_html,
          availability: ele?.available ? "in stock" : "out of stock",
          condition: "new",
          price: `${ele?.price} INR`,
          link: `https://${domainName}/products/${element?.handle}`,
          image_link: element?.images?.[0]?.src,
          brand: element?.vendor,
          sale_price: `${ele?.compare_at_price} INR`,
          item_group_id: element?.id,
        };
        dataToBeExported.push(item);
      });
    });

    const json2csvParser = new Parser({
      fields: [
        "id",
        "title",
        "description",
        "availability",
        "condition",
        "price",
        "link",
        "image_link",
        "brand",
        "sale_price",
        "item_group_id",
      ],
    });
    const csv = json2csvParser.parse(dataToBeExported);

    res.header("Content-Type", "text/csv");
    res.attachment(`${domainName}-facebook-feed.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).send("Error fetching data");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
