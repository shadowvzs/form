import React from 'react';
import RegisterForm1 from './examples/withDecorators';
import RegisterForm2 from './examples/withConfig';
import RegisterForm3 from './examples/withProps';

function App() {

    return (
        <section style={{ height: '100%' }}>
            <article className='form-list'>
                <RegisterForm1 />
                <RegisterForm2 />
                <RegisterForm3 />
            </article>
        </section>

    );
}

export default App;