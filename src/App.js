import { useState, useEffect, useRef } from 'react';
import { CircularProgress, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MaterialTable from 'material-table';

const useStyles = makeStyles(theme => ({
  loading: {
    display: 'grid',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  },
  error: {
    display: 'grid',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    textAlign: 'center',
    color: theme.palette.secondary.main
  },
  table: {
    margin: '3rem 2rem'
  }
}));

const App = () => {
  const classes = useStyles();
  const ref = useRef();

  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState('');
  const [ books, setBooks ] = useState([]);

  useEffect(() => {
    (async() => {
      try {
        const books = await (await fetch('http://localhost:8080/books')).json();
        setBooks(books._embedded.books);
        setLoading(false);
      } catch(err) {
        setLoading(false);
        setError(err.message);
      }
    })();

    return () => {
      setError('');
      setLoading(true);
      setBooks([]);
    }
  }, []);

  const addBook = async book => {
    const added = await (await fetch('http://localhost:8080/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book)
    })).json();
    setBooks([...books, { ...added }]);
  };

  const updateBook = async book => {
    const updated = await (await fetch(`http://localhost:8080/books/${book.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book)
    })).json();
    setBooks([...books.filter(book => book.id !== updated.id), { ...updated } ]);
  };
  
  const deleteBook = async id => {
    await fetch(`http://localhost:8080/books/${id}`, {
      method: 'DELETE'
    });
    setBooks([...books.filter(book => book.id !== id)]);
  };

  return (
    <>
      {
        !loading ? (
          <>
            {
              books && !error ? (
                <div className={classes.table}>
                  <MaterialTable
                    title='Books'
                    columns={[
                      { title: 'Id', field: 'id', editable: false },
                      { title: 'Title', field: 'title' },
                      { title: 'Author', field: 'author' },
                      { title: 'Creation Date', field: 'dateCreation' },
                      { title: 'Pages', field: 'pages', type: 'numeric' }
                    ]}
                    tableRef={ref}
                    data={books ? books.map(book => ({
                      id: book.id,
                      title: book.title ? book.title : 'Unknown',
                      author: book.author ? book.author : 'Unknown',
                      dateCreation: book.dateCreation ? new Date(book.dateCreation).toLocaleDateString() : 'Unknown',
                      pages: book.pages ? book.pages : 'Unknown'
                    })) : []}
                    editable={{
                      onRowAdd: async book => {
                        try {
                          await addBook({ ...book, dateCreation: new Date(book.dateCreation), pages: parseInt(book.pages) });
                        } catch {
                          alert('Could not add book');
                        }
                      },
                      onRowUpdate: async book => {
                        try {
                          await updateBook({ ...book, dateCreation: new Date(book.dateCreation), pages: parseInt(book.pages) });
                        } catch {
                          alert('Could not update book');
                        }
                      },
                      onRowDelete: async book => {
                        try {
                          await deleteBook(book.id);
                        } catch {
                          alert('Could not delete book');
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className={classes.error}>
                  <Typography variant='h2' component='h2'>{error}</Typography>
                </div>
              )
            }
          </>
        ) : (
          <div className={classes.loading}>
            <CircularProgress />
          </div>
        )
      }
    </>
  );
}

export default App;
