module.exports = (message, data) => {
  const { shop_name = 'shop', target_name = 'bạn' } = data;

  let parsed = message.replace(/@NAME_SHOP/gm, shop_name);
  parsed = parsed.replace(/@NAME_CUSTOMER/gm, target_name);

  return parsed;
};
