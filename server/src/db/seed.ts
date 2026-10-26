import { db, pool } from './client.js';
import { salesMethods } from './schema.js';

const methods = [
  { name: 'Facebook Ads', category: 'paid', icon: 'Facebook', description: 'Publicités payantes sur Facebook et Instagram pour cibler des audiences spécifiques' },
  { name: 'TikTok (organique)', category: 'organic', icon: 'Music', description: 'Contenu viral court-format sur TikTok pour générer du trafic naturel' },
  { name: 'WhatsApp Business', category: 'social', icon: 'MessageCircle', description: 'Marketing direct via WhatsApp : listes de diffusion, statuts, conversations' },
  { name: 'Email Marketing', category: 'email', icon: 'Mail', description: "Séquences d'emails et newsletters pour nurturing et conversion" },
  { name: 'YouTube', category: 'organic', icon: 'Youtube', description: 'Tutoriels, démos et contenu éducatif pour attirer et convaincre' },
  { name: 'SEO / Blog', category: 'organic', icon: 'Search', description: 'Optimisation du référencement et articles de blog pour trafic organique' },
  { name: 'Influenceurs', category: 'partnership', icon: 'Users', description: 'Partenariats avec des créateurs de contenu pour promotion' },
  { name: 'Webinaires', category: 'webinar', icon: 'Video', description: 'Sessions en direct pour démontrer la valeur et convertir' },
  { name: "Marketing d'affiliation", category: 'affiliate', icon: 'Share2', description: 'Programme où des partenaires promeuvent le produit contre commission' },
  { name: 'Instagram', category: 'social', icon: 'Instagram', description: 'Reels, stories et posts pour engagement et trafic' },
  { name: 'Telegram', category: 'social', icon: 'Send', description: 'Canaux et groupes Telegram pour diffusion de masse' },
  { name: 'Google Ads', category: 'paid', icon: 'Search', description: 'Publicités sur le réseau de recherche et display Google' },
];

const inserted = await db.insert(salesMethods).values(methods).onConflictDoNothing().returning({ id: salesMethods.id });
console.log(`${inserted.length} méthode(s) ajoutée(s), ${methods.length - inserted.length} déjà présente(s).`);
await pool.end();
