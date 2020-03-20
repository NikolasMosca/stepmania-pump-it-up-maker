import React, { PureComponent } from "react"
import './index.css'

type Properties = {
    holdTime: number
}

class Beat extends PureComponent<Properties> {
    render() {
        const { holdTime } = this.props;
        return (
            <div className="Beat" style={{ width: ((holdTime / 7)+'px') }}> { holdTime } </div>
        )
    }
}

export default Beat