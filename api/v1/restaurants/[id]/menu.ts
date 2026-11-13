import { mockMenus } from '../../../../server/data/menusData.js';

export default function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
    });
  }

  const restaurantId = req.query.id;

  if (!restaurantId || typeof restaurantId !== 'string') {
    return res.status(400).json({
      error: 'Restaurant ID is required',
    });
  }

  const menuItems = mockMenus[restaurantId];

  if (!menuItems) {
    return res.status(404).json({
      error: 'Restaurant menu not found',
    });
  }

  const data = menuItems.map((item) => ({
    ...item,
    imageUrl: '',
  }));

  return res.status(200).json({
    data,
    message: 'Menu loaded successfully',
  });
}


