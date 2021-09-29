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
  const [posts, setPosts] = useState<Post[]>(props.postsPagination.results)
  const [nextPage, setNextPage] = useState<string>(props.postsPagination.next_page)

  async function getMorePosts(){
    const newPage = await fetch(nextPage)
    .then(res => res.json())
    
    setNextPage(newPage.next_page)

    const newPosts = [...posts]

    newPage.results.map(post => {
      newPosts.push({
        uid: post.uid,
          first_publication_date: post.first_publication_date,
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author,
          },
      })
    })

    setPosts(newPosts)
    
  }

  return(
    <div className={commonStyles.container}>
      <head>
        <title>Spacetravelling | Home</title>
      </head>
      <Header />
      <main>
        { posts.map(post => {
          return (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <div className={styles.postBox}>
                <h2>{post.data.title}</h2>
                <p>{post.data.subtitle}</p>
                <div>
                  <span>
                  <FiCalendar/> 
                     <time>
                      {format(new Date(post.first_publication_date), "d MMM yyyy", {locale: ptBR })}  
                     </time>
                  </span>
                  <span><FiUser/> {post.data.author}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </main>
      {nextPage && <span onClick={getMorePosts} className={styles.loadMore}>Carregar mais posts</span>}
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], { pageSize: 1 })


  const posts = postsResponse.results.map(post => {
    return{
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  })

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts
  }

  return {
    props: { 
      postsPagination 
    },
  }

};
