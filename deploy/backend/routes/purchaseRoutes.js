import express from 'express';
import { pool } from '../database/db.js';
import requireAuth from '../middleware/requireAuth.js';
import { ensurePurchaseTables } from '../utils/purchaseStore.js';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    await ensurePurchaseTables();

    const result = await pool.query(
      `
        SELECT
          oi.id,
          oi.quantity,
          oi.unit_price AS price,
          o.created_at AS purchase_date,
          p.id AS product_id,
          p.title,
          p.composer,
          p.arranger,
          p.thumbnail_path
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN products p ON p.id = oi.product_id
        WHERE o.user_id = $1
          AND o.status = 'paid'
        ORDER BY o.created_at DESC, oi.id DESC
      `,
      [req.user.sub]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error('Error loading purchases:', error);
    return res.status(500).json({ error: 'Failed to load purchases' });
  }
});

router.get('/:productId/download', requireAuth, async (req, res) => {
  const productId = Number(req.params.productId);
  const requestedFormat = String(req.query.format || 'pdf').toLowerCase();
  const format = requestedFormat === 'mp3' ? 'mp3' : 'pdf';

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  try {
    await ensurePurchaseTables();

    const entitlementResult = await pool.query(
      `
        SELECT
          p.title,
          pf.pdf_path,
          pf.mp3_path
        FROM products p
        LEFT JOIN product_files pf ON pf.product_id = p.id
        WHERE p.id = $1
          AND EXISTS (
            SELECT 1
            FROM orders o
            JOIN order_items oi ON oi.order_id = o.id
            WHERE o.user_id = $2
              AND o.status = 'paid'
              AND oi.product_id = p.id
          )
        LIMIT 1
      `,
      [productId, req.user.sub]
    );

    if (entitlementResult.rowCount === 0) {
      return res.status(404).json({ error: 'Purchased product not found' });
    }

    const purchasedProduct = entitlementResult.rows[0];
    const relativeFilePath =
      format === 'mp3' ? purchasedProduct.mp3_path : purchasedProduct.pdf_path;

    if (!relativeFilePath) {
      return res.status(404).json({ error: `No ${format.toUpperCase()} file available for this purchase` });
    }

    const uploadsRoot = path.resolve('uploads');
    const resolvedFilePath = path.resolve(relativeFilePath);

    if (
      resolvedFilePath !== uploadsRoot &&
      !resolvedFilePath.startsWith(`${uploadsRoot}${path.sep}`)
    ) {
      return res.status(403).json({ error: 'Invalid file path' });
    }

    try {
      await fs.access(resolvedFilePath);
    } catch {
      return res.status(404).json({ error: 'File not found' });
    }

    const safeTitle = String(purchasedProduct.title || `music-${productId}`)
      .trim()
      .replace(/[^a-zA-Z0-9-_]+/g, '_');
    const extension = format === 'mp3' ? '.mp3' : '.pdf';
    const filename = `${safeTitle || `music-${productId}`}${extension}`;

    return res.download(resolvedFilePath, filename);
  } catch (error) {
    console.error('Error downloading purchased file:', error);
    return res.status(500).json({ error: 'Failed to download file' });
  }
});

export default router;
