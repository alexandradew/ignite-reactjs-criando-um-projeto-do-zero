import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client'

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import { FiCalendar, FiUser } from "react-icons/fi";
import { BsStopwatch } from "react-icons/bs";

import Header from '../../components/Header'
import { RichText } from 'prismic-dom';

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
  return(
    <>
    <div className={styles.container}>
      <Header/>
    </div>
    <div className={styles.banner}/>
    <main className={styles.container}>
        <div className={styles.postWrapper}>
        <strong>{post.data.title}</strong>
        <div className={styles.postInfo}>
          <span><FiCalendar/> 15 MAR 2021</span>
          <span><FiUser/> {post.data.author}</span>
          <span><BsStopwatch/> 4 Min</span>
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

    return{
      paths: [
        { 
          params: { slug: '' }
        }
      ], 
      fallback: 'blocking'
    }

  // TODO
};

export const getStaticProps = async context => {
  const prismic = getPrismicClient();

  const { slug } = context.params
  const response = await prismic.getByUID('post', String(slug), {});

  return{    
      props: { 
      post: {
        first_publication_date: response.first_publication_date,
        data: {
          title: response.data.title,
          banner: {
            url: response.data.banner,
          },
          author: response.data.author,
          content: response.data.content.map(content => {
              return {
                heading: content.heading,
                body: [...content.body],
              }
            })             
          }
        }
      }    
    } 
  }

