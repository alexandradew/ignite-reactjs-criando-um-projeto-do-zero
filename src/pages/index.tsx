import { GetStaticProps } from 'next';
import { useState } from 'react';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client'

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header'

import { FiCalendar, FiUser } from "react-icons/fi";

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Link from 'next/link'



interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home( props: HomeProps ) { 
  const [pageSize, setPageSize] = useState<number>(2)

  function getMorePosts(){
    setPageSize(pageSize + 2)
  }
  return(
    <div className={styles.container}>
      <Header />
      <main>
        { props.postsPagination.results.map(post => {
          return (
            <Link href={`/post/${post.uid}`}>
              <div className={styles.postBox}>
                <h2>{post.data.title}</h2>
                <p>{post.data.subtitle}</p>
                <div>
                  <span><FiCalendar/> {post.first_publication_date}</span>
                  <span><FiUser/> {post.data.author}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </main>
      {props.postsPagination.next_page && <span onClick={() => getMorePosts()}className={styles.loadMore}>Carregar mais posts</span>}
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    fetch: ['post.title', 'post.subtitle', 'post.author'],
    pageSize: 2,
  })

  const postsPagination = []

  postsResponse.results.map(post => {
    postsPagination.push({
      uid: post.uid,
      first_publication_date:
      format(new Date(post.first_publication_date), "d MMM yyyy", {locale: ptBR }).toLocaleUpperCase(),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    })
  })

  return {
    props: { 
      postsPagination: {
        next_page: postsResponse.next_page,
        results: postsPagination
      }
     }
  }

};
