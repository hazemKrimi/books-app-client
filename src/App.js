import { useState, useEffect, useRef } from 'react';
import { CircularProgress, Typography, Snackbar, IconButton } from '@material-ui/core';
import { Close } from '@material-ui/icons';
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

	const [loading, setLoading] = useState(true);
	const [snack, setSnack] = useState(false);
	const [snackMessage, setSnackMessage] = useState('');
	const [error, setError] = useState('');
	const [books, setBooks] = useState([]);

	useEffect(() => {
		(async () => {
			try {
				const books = await (await fetch('http://localhost:8080/books')).json();
				setBooks(books._embedded.books);
				setLoading(false);
			} catch (err) {
				setLoading(false);
				setError(err.message);
			}
		})();

		return () => {
			setError('');
			setSnackMessage('');
			setSnack(false);
			setLoading(true);
			setBooks([]);
		};
	}, []);

	const addBook = async book => {
		try {
			const added = await (
				await fetch('http://localhost:8080/books', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(book)
				})
			).json();
			setBooks([{ ...added }, ...books]);
			setSnackMessage('Book added successfully');
			setSnack(true);
		} catch {
			setSnackMessage('Could not add book');
			setSnack(true);
		}
	};

	const updateBook = async book => {
		try {
			const updated = await (
				await fetch(`http://localhost:8080/books/${book.id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(book)
				})
			).json();
			setBooks([...books.filter(book => book.id !== updated.id), { ...updated }]);
			setSnackMessage('Book updated successfully');
			setSnack(true);
		} catch {
			setSnackMessage('Could not update book');
			setSnack(true);
		}
	};

	const deleteBook = async id => {
		try {
			await fetch(`http://localhost:8080/books/${id}`, {
				method: 'DELETE'
			});
			setBooks([...books.filter(book => book.id !== id)]);
			setSnackMessage('Book deleted successfully');
			setSnack(true);
		} catch {
			setSnackMessage('Could not delete book');
			setSnack(true);
		}
	};

	return (
		<>
			{!loading ? (
				<>
					{books && !error ? (
						<div className={classes.table}>
							<Snackbar
								anchorOrigin={{
									vertical: 'bottom',
									horizontal: 'left'
								}}
								open={snack}
								autoHideDuration={5000}
								onClose={() => setSnack(false)}
								message={snackMessage}
								action={
									<>
										<IconButton
											size='small'
											aria-label='close'
											color='inherit'
											onClick={() => setSnack(false)}
										>
											<Close fontSize='small' />
										</IconButton>
									</>
								}
							/>
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
								data={
									books
										? books.map(book => ({
												id: book.id,
												title: book.title ? book.title : 'Unknown',
												author: book.author ? book.author : 'Unknown',
												dateCreation: book.dateCreation
													? new Date(book.dateCreation).toLocaleDateString()
													: 'Unknown',
												pages: book.pages ? book.pages : 'Unknown'
										  }))
										: []
								}
								editable={{
									onRowAdd: async book => {
										try {
											await addBook({
												...book,
												dateCreation: new Date(book.dateCreation),
												pages: parseInt(book.pages)
											});
										} catch {
											alert('Could not add book');
										}
									},
									onRowUpdate: async book => {
										try {
											await updateBook({
												...book,
												dateCreation: new Date(book.dateCreation),
												pages: parseInt(book.pages)
											});
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
								localization={{
									body: { editRow: { deleteText: 'Are you sure you want to delete this book?' } }
								}}
							/>
						</div>
					) : (
						<div className={classes.error}>
							<Typography variant='h2' component='h2'>
								{error}
							</Typography>
						</div>
					)}
				</>
			) : (
				<div className={classes.loading}>
					<CircularProgress />
				</div>
			)}
		</>
	);
};

export default App;
