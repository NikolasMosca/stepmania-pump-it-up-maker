import React, { PureComponent } from "react"
import './index.css'

type Properties = {
    title?: string,
    children?: any,
    className?: string
}

class Box extends PureComponent<Properties> {
    render() {
        const { title, children, className } = this.props;
        return (
            <section className={ 'Container ' + (className ?? '') }>
                <div className="Header">{ title ?? '' }</div>
                <div className="Main">
                    { children }
                </div>
            </section>
        )
    }
}

export default Box