import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client'

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import { FiCalendar, FiUser } from "react-icons/fi";
import { BsStopwatch } from "react-icons/bs";

import Header from '../../components/Header'
import { RichText } from 'prismic-dom';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import  { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter()

  if(router.isFallback){
    return <h1>Carregando...</h1>
  }

  const totalWords = post.data.content.reduce((total, contentItem) => {
    total += contentItem.heading.split(' ').length;

    const words = contentItem.body.map(item => item.text.split(' ').length);
    words.map(word => (total += word));
    return total;
  }, 0);
  const readTime = Math.ceil(totalWords / 200);

  return(
    <>
    <head>
      <title>Spacetravelling | {`${post.data.title}`}</title>
    </head>
    <div className={commonStyles.container}>
      <Header/>
    </div>
    <div className={styles.banner} style={{ background: `url(${post.data.banner.url})` }}/>
    <main className={commonStyles.container}>
        <div className={styles.postWrapper}>
        <strong>{post.data.title}</strong>
        <div className={styles.postInfo}>
          <span><FiCalendar/> <time>{format(new Date(post.first_publication_date), "d MMM yyyy", {locale: ptBR })} </time></span>
          <span><FiUser/> {post.data.author}</span>
          <span><BsStopwatch/> {`${readTime} min`}</span>
        </div>

        {post.data.content.map(content => {
            return (
              <article className={styles.postBody} key={content.heading}>
                <h2>{content.heading}</h2>
                <div
                  className={styles.postContent}
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </article>
            );
          })}
      </div>
    </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
 
  const posts = await prismic.query([Prismic.predicates.at('document.type', 'post')])

  const paths = posts.results.map(post => {
    return{
      params: {        
        slug: post.uid        
      }
    }    
  })

  return{
    paths,
    fallback: true
  }


};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();

  const { slug } = context.params
  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
          return {
            heading: content.heading,
            body: [...content.body],
          }
        })             
      },      
    }

  return{    
      props: { 
        post
      }    
    } 
  }

