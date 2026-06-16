import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AiOutlineUpload, AiOutlineClose } from 'react-icons/ai';
import { supabase } from '../lib/supabase';
import { uploadToCloudinary } from '../lib/cloudinary';

const DESCRIPTION_TEMPLATE = `About this Dress
[Write a short intro about the dress here]

Fabric and Material
- Fabric: [e.g. Georgette / Cotton / Silk]
- Lining: [Yes / No]
- Transparency: [Slight / None]

Fit and Style
- Type: [e.g. Anarkali / Kurti / Lehenga]
- Fit: [Regular / Flared / Slim]
- Length: [Full length / Knee length / Midi]

Color and Design
- Color: [e.g. Royal Blue with Gold border]
- Pattern: [Floral / Embroidered / Printed / Plain]
- Occasion: [Casual / Festival / Wedding / Party]

Care Instructions
- [e.g. Dry clean only / Hand wash recommended]

What is Included
- [e.g. 1 Kurti + Dupatta / Full Lehenga Set]`;

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Generate a URL-safe slug with timestamp suffix to ensure uniqueness
const generateSlug = (name) => {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base}-${Date.now()}`;
};

const AddDress = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '',
    super_heading: '',
    sizes: [],
    description: DESCRIPTION_TEMPLATE,
    is_featured: false,
    is_favourite: false,
    badge_text: '',
    price: '',
    price_display: '',
    show_price: true,
    // Discount fields
    discount_enabled: false,
    discount_original_price: '',
    discount_type: 'percentage',
    discount_value: '',
    discount_offer_label: '',
  });
  const [images, setImages] = useState([null, null, null, null, null, null]);
  const [previews, setPreviews] = useState([null, null, null, null, null, null]);
  const [existingUrls, setExistingUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState([0, 0, 0, 0, 0, 0]);
  const [warnings, setWarnings] = useState([null, null, null, null, null, null]);

  useEffect(() => {
    if (isEdit) {
      supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
          if (error) console.error('Fetch product error:', error);
          if (data) {
            setForm({
              name: data.name || '',
              super_heading: data.super_heading || '',
              sizes: data.sizes || [],
              description: data.description || DESCRIPTION_TEMPLATE,
              is_featured: data.is_featured || false,
              is_favourite: data.is_favourite || false,
              badge_text: data.badge_text || '',
              price: data.price != null ? String(data.price) : '',
              price_display: data.price_display || '',
              show_price: data.show_price !== false,
              // Discount fields
              discount_enabled: data.discount_enabled || false,
              discount_original_price: data.discount_original_price != null ? String(data.discount_original_price) : '',
              discount_type: data.discount_type || 'percentage',
              discount_value: data.discount_value != null ? String(data.discount_value) : '',
              discount_offer_label: data.discount_offer_label || '',
            });
            setExistingUrls(data.images || []);
          }
        });
    }
  }, [id, isEdit]);

  const handleImageSelect = (idx, file) => {
    if (!file) return;
    const newWarnings = [...warnings];
    const newImages = [...images];
    const newPreviews = [...previews];

    if (file.size > 5 * 1024 * 1024) {
      newWarnings[idx] = '⚠️ Image exceeds 5MB limit';
    } else {
      newWarnings[idx] = null;
    }

    newImages[idx] = file;
    newPreviews[idx] = URL.createObjectURL(file);
    setImages(newImages);
    setPreviews(newPreviews);
    setWarnings(newWarnings);
  };

  const removeImage = (idx) => {
    const ni = [...images]; ni[idx] = null;
    const np = [...previews]; np[idx] = null;
    const nw = [...warnings]; nw[idx] = null;
    setImages(ni); setPreviews(np); setWarnings(nw);
  };

  const removeExisting = (idx) => {
    setExistingUrls(prev => prev.filter((_, i) => i !== idx));
  };

  const toggleSize = (size) => {
    setForm(f => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter(s => s !== size) : [...f.sizes, size],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      window.alert('Please enter a dress name.');
      return;
    }

    setUploading(true);

    try {
      // Upload images to Cloudinary
      const uploadedUrls = [];
      
      for (let i = 0; i < images.length; i++) {
        if (images[i]) {
          try {
            const url = await uploadToCloudinary(images[i], (p) => {
              const prog = [...progress]; prog[i] = p; setProgress(prog);
            });
            uploadedUrls.push(url);
            console.log(`[AddDress] Image ${i} uploaded:`, url);
          } catch (uploadErr) {
            console.error(`[AddDress] Image ${i} upload failed:`, uploadErr);
            window.alert(`Internal error is occured: Image upload failed - ${uploadErr.message}`);
            setUploading(false);
            return;
          }
        }
      }

      const allImages = [...existingUrls, ...uploadedUrls];

      let effectivePrice = form.price !== '' ? parseFloat(form.price) : null;
      let effectiveShowPrice = form.show_price;
      
      if (form.discount_enabled) {
        const orig = parseFloat(form.discount_original_price) || 0;
        const val = parseFloat(form.discount_value) || 0;
        effectivePrice = form.discount_type === 'percentage'
          ? orig - (orig * val / 100)
          : orig - val;
        effectiveShowPrice = true;
      }

      const productData = {
        name: form.name.trim(),
        super_heading: form.super_heading.trim() || null,
        slug: isEdit ? undefined : generateSlug(form.name.trim()),
        sizes: form.sizes,
        description: form.description,
        is_featured: form.is_featured,
        is_favourite: form.is_favourite,
        badge_text: form.badge_text.trim() || null,
        price: effectivePrice,
        price_display: form.price_display.trim() || null,
        show_price: effectiveShowPrice,
        images: allImages,
        is_available: true,
        updated_at: new Date().toISOString(),
        // Discount fields
        discount_enabled: form.discount_enabled,
        discount_original_price: form.discount_original_price !== '' ? parseFloat(form.discount_original_price) : null,
        discount_type: form.discount_type || 'percentage',
        discount_value: form.discount_value !== '' ? parseFloat(form.discount_value) : null,
        discount_offer_label: form.discount_offer_label.trim() || null,
      };

      // Remove undefined keys (slug on edit)
      Object.keys(productData).forEach(k => productData[k] === undefined && delete productData[k]);

      console.log('[AddDress] Submitting productData:', productData);

      let dbError;
      if (isEdit) {
        const result = await supabase.from('products').update(productData).eq('id', id);
        dbError = result.error;
        console.log('[AddDress] Update result:', result);
      } else {
        const result = await supabase.from('products').insert([{
          ...productData,
          created_at: new Date().toISOString(),
        }]);
        dbError = result.error;
        console.log('[AddDress] Insert result:', result);
      }

      if (dbError) {
        console.error('[AddDress] Supabase error:', dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

      window.alert(`✅ Your dress is ${isEdit ? 'updated' : 'added'} successfully!`);
      navigate('/manage');
    } catch (err) {
      console.error('[AddDress] Submit error:', err);
      window.alert(`Internal error is occured: ${err.message || 'Something went wrong.'}`);
    }

    setUploading(false);
  };

  const handleUpdateDescription = async (e) => {
    e.preventDefault();
    if (!isEdit) return;
    setUploading(true);

    try {
      const { error } = await supabase
        .from('products')
        .update({ description: form.description })
        .eq('id', id);

      if (error) throw error;
      window.alert('✅ Description updated successfully!');
    } catch (err) {
      console.error('[AddDress] Update Description error:', err);
      window.alert(`Internal error is occured: ${err.message || 'Something went wrong.'}`);
    }

    setUploading(false);
  };

  return (
    <div>
      <div className="admin-topbar">
        <h1>{isEdit ? 'Edit Dress' : 'Add New Dress'}</h1>
      </div>

      <div className="admin-content">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Left */}
            <div>
              <div className="admin-card" style={{ marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--sage-dark)', marginBottom: 20 }}>
                  Basic Info
                </h3>
                <div className="form-group">
                  <label className="form-label">
                    Super Heading <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(Collection label — visible in Shop)</span>
                  </label>
                  <input
                    type="text" className="form-input"
                    value={form.super_heading} onChange={e => setForm({ ...form, super_heading: e.target.value })}
                    placeholder="e.g. Ethnic Wear · Women's Collection · New Arrivals"
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: 5, lineHeight: 1.4 }}>
                    Shows above the dress name in the Shop card and on the product page. Use for collection/category labels.
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Dress Name / Heading <span>*</span></label>
                  <input
                    type="text" className="form-input"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Floral Georgette Anarkali" required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Badge Text <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(optional)</span></label>
                  <input
                    type="text" className="form-input"
                    value={form.badge_text} onChange={e => setForm({ ...form, badge_text: e.target.value })}
                    placeholder="e.g. New Arrival, Bestseller"
                  />
                </div>

                {/* Regular Price Fields - Show only if discount is not enabled */}
                {!form.discount_enabled && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Price (₹) <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(optional)</span></label>
                      <input
                        type="number" className="form-input"
                        value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                        placeholder="e.g. 1499"
                        min="0"
                        step="1"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Price Display Text <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(overrides number, optional)</span></label>
                      <input
                        type="text" className="form-input"
                        value={form.price_display} onChange={e => setForm({ ...form, price_display: e.target.value })}
                        placeholder="e.g. ₹1,499 or Contact for price"
                      />
                    </div>
                    <div className="form-group">
                      <label className="toggle-wrap" style={{ cursor: 'pointer' }}>
                        <div className="toggle">
                          <input type="checkbox" checked={form.show_price} onChange={e => setForm({ ...form, show_price: e.target.checked })} />
                          <span className="toggle-slider"></span>
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>Show Price on Product Page</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Toggle whether the price is visible to customers</div>
                        </div>
                      </label>
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label className="form-label">Sizes Available</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {SIZES.map(size => (
                      <button
                        key={size} type="button"
                        onClick={() => toggleSize(size)}
                        style={{
                          padding: '8px 16px',
                          border: '1.5px solid',
                          borderColor: form.sizes.includes(size) ? 'var(--sage-dark)' : 'var(--border)',
                          background: form.sizes.includes(size) ? 'var(--sage-dark)' : 'white',
                          color: form.sizes.includes(size) ? 'white' : 'var(--text-mid)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >{size}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="admin-card" style={{ marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--sage-dark)', marginBottom: 20 }}>
                  Visibility
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <label className="toggle-wrap">
                    <div className="toggle">
                      <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} />
                      <span className="toggle-slider"></span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>Mark as Featured</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Shows on the Home page featured section</div>
                    </div>
                  </label>
                  <label className="toggle-wrap">
                    <div className="toggle">
                      <input type="checkbox" checked={form.is_favourite} onChange={e => setForm({ ...form, is_favourite: e.target.checked })} />
                      <span className="toggle-slider"></span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>Mark as Favourite</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Highlighted as store favourite</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* ====== DISCOUNT CARD ====== */}
              <div className="admin-card" style={{ marginBottom: 20, border: form.discount_enabled ? '1.5px solid #81c784' : '1px solid var(--border)' }}>
                <label className="toggle-wrap" style={{ cursor: 'pointer', marginBottom: form.discount_enabled ? 20 : 0 }}>
                  <div className="toggle">
                    <input
                      type="checkbox"
                      checked={form.discount_enabled}
                      onChange={e => setForm({ ...form, discount_enabled: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Enable Discount</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Amazon / Myntra style price drop with strikethrough MRP</div>
                  </div>
                </label>

                {form.discount_enabled && (
                  <>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label className="form-label">Original Price (₹)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={form.discount_original_price}
                        onChange={e => setForm({ ...form, discount_original_price: e.target.value })}
                        placeholder="e.g. 2000"
                        min="0"
                        step="1"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                      <div>
                        <label className="form-label">Discount Type</label>
                        <select
                          className="form-input"
                          value={form.discount_type}
                          onChange={e => setForm({ ...form, discount_type: e.target.value })}
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="flat">Flat Amount (₹)</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label">Discount Value</label>
                        <input
                          type="number"
                          className="form-input"
                          value={form.discount_value}
                          onChange={e => setForm({ ...form, discount_value: e.target.value })}
                          placeholder={form.discount_type === 'percentage' ? 'e.g. 50' : 'e.g. 500'}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label className="form-label">Offer Label <span style={{ color: 'var(--text-light)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                      <input
                        type="text"
                        className="form-input"
                        value={form.discount_offer_label}
                        onChange={e => setForm({ ...form, discount_offer_label: e.target.value })}
                        placeholder="e.g. Limited time offer"
                      />
                    </div>

                    {/* Live Preview */}
                    {form.discount_original_price && form.discount_value && (
                      (() => {
                        const orig = parseFloat(form.discount_original_price) || 0;
                        const val = parseFloat(form.discount_value) || 0;
                        const salePrice = form.discount_type === 'percentage'
                          ? orig - (orig * val / 100)
                          : orig - val;
                        const saving = orig - salePrice;
                        // Badge always shows the % or ₹ calculation — NEVER offer label
                        const badgeText = form.discount_type === 'percentage'
                          ? `${val}% OFF`
                          : `₹${val.toLocaleString('en-IN')} OFF`;
                        return (
                          <div style={{
                            background: 'linear-gradient(135deg, #f0fff4, #e8f5e9)',
                            border: '1.5px solid #81c784',
                            borderRadius: 8,
                            padding: '14px 16px',
                          }}>
                            <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1e8e3e', marginBottom: 8 }}>Live Preview</div>
                            <div style={{ textDecoration: 'line-through', color: '#7a9082', fontSize: '0.85rem', marginBottom: 4 }}>
                              ₹{orig.toLocaleString('en-IN')}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1a2e25' }}>
                                ₹{salePrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                              </span>
                              <span style={{ background: '#ff6f00', color: 'white', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 4, textTransform: 'uppercase' }}>
                                {badgeText}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e8e3e', marginBottom: form.discount_offer_label ? 6 : 0 }}>
                              You save ₹{saving.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </div>
                            {form.discount_offer_label && (
                              <div style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', background: '#fff3e0', color: '#e65100', fontSize: '0.72rem', fontWeight: 600, borderRadius: 20, border: '1px solid #ffb74d', marginTop: 2 }}>
                                🏷️ {form.discount_offer_label}
                              </div>
                            )}
                          </div>
                        );
                      })()
                    )}
                  </>
                )}
              </div>

              <div className="admin-card" style={{ marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--sage-dark)', marginBottom: 12 }}>
                  Markdown Instructions
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-mid)', lineHeight: 1.6 }}>
                  <p style={{ marginBottom: 8 }}>You can use Markdown to format the description text.</p>
                  <ul style={{ paddingLeft: 20, marginBottom: 8, color: 'var(--text-light)' }}>
                    <li><strong>Bold</strong>: <code>**text**</code></li>
                    <li><em>Italic</em>: <code>*text*</code></li>
                    <li>Bullet List: <code>- item</code> or <code>* item</code></li>
                    <li>Numbered List: <code>1. item</code></li>
                    <li>Headings: <code># Heading 1</code> to <code>###### Heading 6</code></li>
                  </ul>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Note: Single line breaks might be ignored, use double line breaks for a new paragraph or lists.</p>
                </div>
              </div>
            </div>

            {/* Right */}
            <div>
              {/* Images */}
              <div className="admin-card" style={{ marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--sage-dark)', marginBottom: 8 }}>
                  Product Images
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: 16 }}>
                  First image is the cover. Max 5MB each. Up to 6 images. (Optional)
                </p>

                {/* Existing images (edit mode) */}
                {existingUrls.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', marginBottom: 8 }}>
                      Current Images
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {existingUrls.map((url, i) => (
                        <div key={i} style={{ position: 'relative', width: 72, height: 96, borderRadius: 8, overflow: 'hidden', border: '1.5px solid var(--border)' }}>
                          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => removeExisting(i)}
                            style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 10 }}
                          ><AiOutlineClose size={10} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="image-upload-grid">
                  {images.map((img, i) => (
                    <div key={i}>
                      <div
                        style={{
                          position: 'relative',
                          aspectRatio: '3/4',
                          border: '2px dashed var(--border)',
                          borderRadius: 8,
                          overflow: 'hidden',
                          background: previews[i] ? 'transparent' : 'var(--sage-mist)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'border-color 0.2s',
                        }}
                        onClick={() => !previews[i] && document.getElementById(`img-${i}`).click()}
                      >
                        {previews[i] ? (
                          <>
                            <img src={previews[i]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                              style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            ><AiOutlineClose size={12} /></button>
                            {uploading && progress[i] > 0 && (
                              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'rgba(255,255,255,0.3)' }}>
                                <div style={{ height: '100%', width: `${progress[i]}%`, background: 'var(--sage-light)', transition: 'width 0.2s' }} />
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <AiOutlineUpload size={20} style={{ color: 'var(--text-light)', marginBottom: 4 }} />
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-light)', textAlign: 'center' }}>
                              {i === 0 ? 'Cover' : `Photo ${i + 1}`}
                            </span>
                          </>
                        )}
                      </div>
                      <input
                        id={`img-${i}`}
                        type="file"
                        accept="image/jpeg,image/webp,image/png,image/jpg"
                        style={{ display: 'none' }}
                        onChange={e => handleImageSelect(i, e.target.files[0])}
                      />
                      {warnings[i] && (
                        <p style={{ fontSize: '0.65rem', color: 'var(--warning)', marginTop: 4 }}>{warnings[i]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="admin-card">
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--sage-dark)', marginBottom: 8 }}>
                  Markdown Description
                </h3>
                <textarea
                  className="form-textarea"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  style={{ minHeight: 280 }}
                />
                {isEdit && (
                  <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      type="button" 
                      className="btn-admin-secondary" 
                      onClick={handleUpdateDescription}
                      disabled={uploading}
                    >
                      {uploading ? 'Updating...' : 'Update Description Only'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 16, marginTop: 24, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-admin-secondary" onClick={() => navigate('/manage')}>
              Cancel
            </button>
            <button type="submit" className="btn-admin-primary" disabled={uploading}>
              {uploading ? 'Saving...' : isEdit ? 'Update Dress' : 'Add Dress'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDress;
