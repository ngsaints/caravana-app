import type { Municipality, Association } from '../types';

export const municipalities: Municipality[] = [
  { name: 'Vitória', lat: -20.3155, lng: -40.3128 },
  { name: 'Vila Velha', lat: -20.3297, lng: -40.2925 },
  { name: 'Serra', lat: -20.1287, lng: -40.3075 },
  { name: 'Cariacica', lat: -20.2619, lng: -40.4177 },
  { name: 'Cachoeiro de Itapemirim', lat: -20.8486, lng: -41.1129 },
  { name: 'Colatina', lat: -19.5396, lng: -40.6306 },
  { name: 'Guarapari', lat: -20.6686, lng: -40.4988 },
  { name: 'Aracruz', lat: -19.8225, lng: -40.2738 },
  { name: 'Marataízes', lat: -21.0404, lng: -40.8333 },
  { name: 'São Mateus', lat: -18.7157, lng: -39.8578 },
  { name: 'Linhares', lat: -19.3908, lng: -40.0723 },
  { name: 'Nova Venélia', lat: -18.7105, lng: -40.4038 },
  { name: 'Santa Leopoldina', lat: -20.1664, lng: -40.5334 },
  { name: 'Domingos Martins', lat: -20.3633, lng: -40.6628 },
  { name: 'Itarana', lat: -20.1383, lng: -40.6422 },
  { name: 'Mantenópolis', lat: -18.8622, lng: -41.1303 },
  { name: 'Venda Nova', lat: -20.3278, lng: -41.1283 },
  { name: 'Castelo', lat: -20.6169, lng: -41.1936 },
  { name: 'Alegre', lat: -20.7599, lng: -41.5349 },
  { name: 'Pinheiros', lat: -18.4173, lng: -40.2155 },
  { name: 'Jaguaré', lat: -18.9642, lng: -40.1617 },
  { name: 'Conceição da Barra', lat: -18.4974, lng: -39.7394 },
  { name: 'Anchieta', lat: -20.8056, lng: -40.6414 },
  { name: 'Presidente Kennedy', lat: -21.0936, lng: -41.0536 },
  { name: 'Jerônimo Monteiro', lat: -20.7984, lng: -41.3051 },
];

export const associations: Association[] = [
  { id: 1, name: 'Associação Cultural de Vitória', municipality: 'Vitória', category: 'Música', region: 'Grande Vitória', lat: -20.3155, lng: -40.3128 },
  { id: 2, name: 'Grupo de Dança Folclórica Capixaba', municipality: 'Vila Velha', category: 'Dança', region: 'Grande Vitória', lat: -20.3297, lng: -40.2925 },
  { id: 3, name: 'Teatro Experimental de Serra', municipality: 'Serra', category: 'Teatro', region: 'Grande Vitória', lat: -20.1287, lng: -40.3075 },
  { id: 4, name: 'Associação de Artesãos de Cachoeiro', municipality: 'Cachoeiro de Itapemirim', category: 'Artesanato', region: 'Sul do ES', lat: -20.8486, lng: -41.1129 },
  { id: 5, name: 'Centro de Tradições Nordestinas', municipality: 'Colatina', category: 'Patrimônio Cultural', region: 'Central', lat: -19.5396, lng: -40.6306 },
];

export const categories = [
  'Música', 'Dança', 'Teatro', 'Artes Visuais', 'Patrimônio Cultural', 'Cinema', 'Literatura', 'Artesanato'
];

export const regions = ['Grande Vitória', 'Norte do ES', 'Sul do ES', 'Central', 'Serrana'];