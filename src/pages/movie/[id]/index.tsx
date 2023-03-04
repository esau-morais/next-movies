import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'

import { env } from '@/lib/env'
import type { Result } from '@/lib/types/data'
import { abbreviateBudget } from '@/utils/budget'
import { cn } from '@/utils/classNames'
import { toBase64, shimmer } from '@/utils/shimmer'
import { formatMinutesToHour } from '@/utils/time'
import { StarRate } from '@mui/icons-material'
import {
  Grid,
  Chip,
  Container,
  Stack,
  Typography,
  Avatar,
  AvatarGroup,
} from '@mui/material'

const SingleMoviePage = ({
  data: { movie, credit },
}: {
  data: { movie: Result; credit: any }
}) => {
  const date = new Date(movie.release_date)

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  } satisfies Intl.DateTimeFormatOptions

  const formattedReleaseDate = new Intl.DateTimeFormat('en-US', options).format(
    date
  )

  return (
    <>
      <Head>
        <title>{movie.title}</title>
        <meta name="description" content={movie.overview} />
      </Head>

      <Container maxWidth="xl">
        <div className="relative my-2 aspect-video h-full max-h-[60vh] w-full overflow-hidden rounded-2xl bg-black">
          <Image
            className={cn(
              'object-cover opacity-50',
              'transition-all duration-500 hover:scale-105 active:scale-100'
            )}
            src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`}
            alt={movie.title}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 100vw,
                  (max-width: 1280px) 50vw,
                  (max-width: 1536px) 33vw,
                  25vw"
            placeholder="blur"
            blurDataURL={`data:image/svg+xml;base64,${toBase64(
              shimmer(96, 96)
            )}`}
            draggable={false}
          />
          <div className="absolute bottom-4 left-4 text-white">
            <Typography className="movie-title" variant="h3" component="h1">
              {movie.title}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography
                className="inline-flex items-center space-x-2"
                variant="body1"
              >
                <StarRate className="text-[#D9A931]" />
                <span>{movie.vote_average.toFixed(1)}</span>
              </Typography>
              <Typography variant="body2">{movie.vote_count}</Typography>
            </Stack>
          </div>
        </div>

        {movie.genres.map((genre) => (
          <Chip
            className="mr-2 last-of-type:mr-0"
            key={genre.id}
            label={genre.name}
            size="small"
            variant="outlined"
            color="primary"
          />
        ))}

        <Grid container columns={{ xs: 1, md: 6 }} spacing={2}>
          <Grid item xs={6} md={4}>
            <Grid item xs={6} md={4}>
              <Typography mt={2} variant="h6" component="h2">
                Overview
              </Typography>
              <Typography variant="body1">{movie.overview}</Typography>
            </Grid>
            <Grid item xs={6} md={4}>
              <Typography mt={2} variant="h6" component="h2">
                Cast
              </Typography>
              <AvatarGroup max={10}>
                {credit.cast?.map((person) => (
                  <Avatar
                    key={person.id}
                    src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                    alt={person.name}
                  />
                ))}
              </AvatarGroup>
            </Grid>
          </Grid>
          <Grid item xs={6} md={2}>
            <Grid item xs={6} md={2}>
              <Typography mt={2} variant="h6" component="h2">
                Release
              </Typography>
              <Typography variant="body1">{formattedReleaseDate}</Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography mt={2} variant="h6" component="h2">
                Budget
              </Typography>
              <Typography variant="body1">
                ${abbreviateBudget(movie.budget)}
              </Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography mt={2} variant="h6" component="h2">
                Length
              </Typography>
              <Typography variant="body1">
                {formatMinutesToHour(movie.runtime)}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}

const { NEXT_PUBLIC_API_BASE_URL, API_KEY } = env

const findSingleMovieDetailsById = async (id: string) => {
  const res = await fetch(
    `${NEXT_PUBLIC_API_BASE_URL}/movie/${id}?api_key=${API_KEY}`
  )
  return (await res.json()) as { data: Result }
}

const findSingleMovieCreditsById = async (id: string) => {
  const res = await fetch(
    `${NEXT_PUBLIC_API_BASE_URL}/movie/${id}/credits?api_key=${API_KEY}`
  )
  return (await res.json()) as { data: any }
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  let movie, credit

  const [movieRes, creditRes] = await Promise.allSettled([
    findSingleMovieDetailsById(params?.id as string),
    findSingleMovieCreditsById(params?.id as string),
  ])

  if (movieRes.status === 'fulfilled') {
    movie = movieRes.value
  } else {
    console.error(movieRes)
  }

  if (creditRes.status === 'fulfilled') {
    credit = creditRes.value
  } else {
    console.error(creditRes)
  }

  return {
    props: {
      data: {
        movie,
        credit,
      },
    },
  }
}

export default SingleMoviePage