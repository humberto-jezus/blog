import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const seedDatabase = async () => {
  // If we already seeded the database in this browser, skip the expensive call
  if (localStorage.getItem('db_seeded') === 'true') {
    return;
  }

  try {
    const postsRef = collection(db, 'posts');
    const snapshot = await getDocs(postsRef);

    if (snapshot.empty) {
      console.log('Seeding database with initial articles...');
      const samplePosts = [
        {
          title: 'Hospedagem de aplicativos Web com o Azure App Service',
          excerpt: 'Crie, implante e dimensione aplicativos Web e APIs rapidamente em seus próprios termos. Trabalhe com .NET, Node.js, Python, Java ou Ruby.',
          content: 'O Serviço de Aplicativo do Azure é um serviço baseado em HTTP para hospedagem de aplicativos Web, APIs REST e back-ends móveis.\n\n### Por que usar o App Service?\n- **Alta produtividade**: Comece a trabalhar rapidamente com ambientes totalmente gerenciados.\n- **Escala global**: Escale vertical e horizontalmente de forma automática.\n- **Segurança**: Conformidade com padrões globais e integrações com Azure Active Directory.',
          category: 'App Service',
          imageUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?q=80&w=800&auto=format&fit=crop',
          date: 'Mar 15, 2026',
          readTime: '5 min read',
          author: 'Microsoft Azure',
          authorUid: 'seed',
          language: 'pt',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        {
          title: 'Escalabilidade Global com Azure Front Door',
          excerpt: 'Ofereça experiências de usuário rápidas, seguras e altamente escalonáveis para seus aplicativos da Web em todo o mundo.',
          content: 'O Azure Front Door é a rede de entrega de conteúdo (CDN) em nuvem moderna da Microsoft que fornece acesso rápido, confiável e seguro.\n\n### Recursos Principais\n- Aceleração de aplicativos estáticos e dinâmicos.\n- Balanceamento de carga global.\n- Proteção contra DDoS e Web Application Firewall (WAF).',
          category: 'Networking',
          imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
          date: 'Mar 14, 2026',
          readTime: '4 min read',
          author: 'Microsoft Azure',
          authorUid: 'seed',
          language: 'pt',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        {
          title: 'Protegendo seus dados com o Azure Key Vault',
          excerpt: 'Proteja chaves criptográficas e outros segredos usados por aplicativos e serviços em nuvem.',
          content: 'O Azure Key Vault ajuda a resolver os seguintes problemas:\n\n- **Gerenciamento de Segredos**: Armazene e controle rigidamente o acesso a tokens, senhas, certificados, chaves de API e outros segredos.\n- **Gerenciamento de Chaves**: Crie e controle as chaves de criptografia usadas para criptografar seus dados.\n- **Gerenciamento de Certificados**: Provisione, gerencie e implante facilmente certificados SSL/TLS públicos e privados.',
          category: 'Security',
          imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop',
          date: 'Mar 10, 2026',
          readTime: '6 min read',
          author: 'Microsoft Azure',
          authorUid: 'seed',
          language: 'pt',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      ];

      for (const post of samplePosts) {
        await addDoc(postsRef, post);
      }
      console.log('Database seeded successfully!');
    }
    
    // Set flag in localStorage so we don't query every time
    localStorage.setItem('db_seeded', 'true');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
