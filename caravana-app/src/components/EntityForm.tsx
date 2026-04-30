import { useState } from 'react';
import { useCreateEntity, ENTITY_TYPES, CATEGORIES, useMunicipalities } from '../hooks/useApi';

interface EntityFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function EntityForm({ onSuccess, onCancel }: EntityFormProps) {
  const { create, loading, error } = useCreateEntity();
  const municipalities = useMunicipalities();

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    category: '',
    municipality: '',
    region: '',
    lat: -19.92,
    lng: -40.31,
    address: '',
    phone: '',
    email: '',
    website: '',
    socialMedia: '',
    description: '',
    services: '',
    foundedYear: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (key === 'type') {
      setFormData((prev) => ({ ...prev, category: '', [key]: value }));
    }
    if (key === 'municipality') {
      const mun = municipalities.find((m) => m.name === value);
      if (mun) {
        setFormData((prev) => ({
          ...prev,
          municipality: value,
          region: mun.region,
          lat: mun.lat,
          lng: mun.lng
        }));
      }
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.type) newErrors.type = 'Tipo é obrigatório';
    if (!formData.category) newErrors.category = 'Categoria é obrigatória';
    if (!formData.municipality) newErrors.municipality = 'Município é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await create({
        name: formData.name,
        type: formData.type,
        category: formData.category,
        municipality: formData.municipality,
        region: formData.region,
        lat: formData.lat,
        lng: formData.lng,
        address: formData.address || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        website: formData.website || undefined,
        socialMedia: formData.socialMedia || undefined,
        description: formData.description || undefined,
        services: formData.services || undefined,
        foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : undefined
      });
      onSuccess();
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="entity-form">
      <h2>Cadastrar Nova Entidade</h2>
      <p className="form-subtitle">Preencha os dados da entidade cultural</p>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Nome da Entidade *</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: Associação Cultural de Vitória"
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">Tipo *</label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className={errors.type ? 'input-error' : ''}
            >
              <option value="">Selecione o tipo</option>
              {ENTITY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {errors.type && <span className="error-text">{errors.type}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Categoria *</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              disabled={!formData.type}
              className={errors.category ? 'input-error' : ''}
            >
              <option value="">Selecione a categoria</option>
              {formData.type && CATEGORIES[formData.type]?.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <span className="error-text">{errors.category}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="municipality">Município *</label>
            <select
              id="municipality"
              value={formData.municipality}
              onChange={(e) => handleChange('municipality', e.target.value)}
              className={errors.municipality ? 'input-error' : ''}
            >
              <option value="">Selecione o município</option>
              {municipalities.map((m) => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
            {errors.municipality && <span className="error-text">{errors.municipality}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="region">Região</label>
            <input
              id="region"
              type="text"
              value={formData.region}
              readOnly
              placeholder="Região automaticamente preenchida"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="address">Endereço</label>
            <input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Rua, número, bairro"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone">Telefone</label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="(27) 99999-9999"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="contato@entidade.org.br"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="socialMedia">Redes Sociais</label>
            <input
              id="socialMedia"
              type="text"
              value={formData.socialMedia}
              onChange={(e) => handleChange('socialMedia', e.target.value)}
              placeholder="@instagram ou Facebook"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="foundedYear">Ano de Fundação</label>
            <input
              id="foundedYear"
              type="number"
              value={formData.foundedYear}
              onChange={(e) => handleChange('foundedYear', e.target.value)}
              placeholder="2020"
              min="1800"
              max="2030"
            />
          </div>

          <div className="form-group">
            <label htmlFor="services">Serviços/Atividades</label>
            <input
              id="services"
              type="text"
              value={formData.services}
              onChange={(e) => handleChange('services', e.target.value)}
              placeholder="Ex: Aulas de dança, oficinas"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descreva a entidade, sua história e atividades..."
              rows={4}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Enviando...' : 'Cadastrar Entidade'}
          </button>
        </div>
      </form>
    </div>
  );
}
